import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataTableColumnDto,
  DataTableOrderDto,
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { formatDecimal } from '../common/utils/format.utils';
import { PrismaService } from '../prisma/prisma.service';
import { AplicarCorteDto } from './dto/aplicar-corte.dto';
import { CreatePlacaDto } from './dto/create-placa.dto';
import { GerenciarProducaoPlacaDto } from './dto/gerenciar-producao-placa.dto';
import { PlacaQueryDto } from './dto/placa-query.dto';
import { UpdatePlacaDto } from './dto/update-placa.dto';
import {
  DirecaoCorte,
  GeometriaPlaca,
  VetorCorte,
} from './utils/geometria.utils';

@Injectable()
export class PlacasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlacaDto) {
    const {
      tipoPlacaId,
      quantidade,
      jaFinalizada,
      deduzirMateriaPrima,
      economiaInfo,
    } = dto;

    // Busca o tipo de placa com materiais
    const tipoPlaca = await this.prisma.tipoPlaca.findUnique({
      where: { id: tipoPlacaId },
      include: {
        materiais: { include: { materiaPrima: true } },
      },
    });

    if (!tipoPlaca || tipoPlaca.deletedAt) {
      throw new NotFoundException('Tipo de placa não encontrado.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Calcula economia por placa para cada material (se aplicável)
      const economiaPorPlaca = new Map<number, number>();
      if (
        jaFinalizada &&
        deduzirMateriaPrima &&
        economiaInfo &&
        economiaInfo.itens.length > 0
      ) {
        for (const item of economiaInfo.itens) {
          const materialTipo = tipoPlaca.materiais.find(
            (m) => m.materiaPrimaId === item.materiaPrimaId,
          );
          if (!materialTipo) continue;

          if (economiaInfo.modo === 'individual') {
            if (item.quantidade >= materialTipo.quantidade) {
              throw new BadRequestException(
                `Economia individual (${item.quantidade}) deve ser menor que o consumo por placa (${materialTipo.quantidade}) para o material "${materialTipo.materiaPrima.item}".`,
              );
            }
            economiaPorPlaca.set(item.materiaPrimaId, item.quantidade);
          } else {
            // modo total
            const consumoTotal = materialTipo.quantidade * quantidade;
            if (item.quantidade >= consumoTotal) {
              throw new BadRequestException(
                `Economia total (${item.quantidade}) deve ser menor que o consumo total (${consumoTotal}) para o material "${materialTipo.materiaPrima.item}".`,
              );
            }
            // Distribui igualmente entre as placas
            economiaPorPlaca.set(
              item.materiaPrimaId,
              item.quantidade / quantidade,
            );
          }
        }
      }

      // Cria as placas
      const resultados = [];
      for (let i = 0; i < quantidade; i++) {
        // Cria a placa primeiro para obter o ID
        const placa = await tx.placa.create({
          data: {
            nome: '__TEMP__', // Temporário, será atualizado com P{id}
            tipoPlacaId,
            statusProducao: jaFinalizada ? 'FINALIZADA' : 'AGUARDANDO',
            statusPlaca: 'DISPONIVEL',
          },
        });

        // Atualiza o nome com P{id}
        const nome = `P${placa.id}`;
        await tx.placa.update({
          where: { id: placa.id },
          data: { nome },
        });

        // Se jaFinalizada e deduzirMateriaPrima, deduz do estoque
        if (jaFinalizada && deduzirMateriaPrima) {
          const consumos: Record<string, number> = {};
          for (const material of tipoPlaca.materiais) {
            const economia = economiaPorPlaca.get(material.materiaPrimaId) || 0;
            const consumoReal = material.quantidade - economia;

            if (consumoReal > 0) {
              const mp = await tx.materiaPrima.findUnique({
                where: { id: material.materiaPrimaId },
              });
              if (!mp || mp.quantidade < consumoReal) {
                throw new BadRequestException(
                  `Material insuficiente para a baixa: ${mp?.item || material.materiaPrimaId}`,
                );
              }
              await tx.materiaPrima.update({
                where: { id: material.materiaPrimaId },
                data: { quantidade: { decrement: consumoReal } },
              });
              consumos[material.materiaPrimaId.toString()] = consumoReal;
            }
          }

          if (Object.keys(consumos).length > 0) {
            await tx.placa.update({
              where: { id: placa.id },
              data: { materiaisConsumidos: consumos },
            });
          }
        }

        resultados.push({ ...placa, nome });
      }

      return {
        message: `${quantidade} placa(s) criada(s) com sucesso.`,
        ids: resultados.map((r) => r.id),
        nomes: resultados.map((r) => r.nome),
      };
    });
  }

  async findAll() {
    return this.prisma.placa.findMany({
      orderBy: { id: 'desc' },
      include: {
        tipoPlaca: true,
      },
    });
  }

  async findDatatable(query: PlacaQueryDto): Promise<DataTableResult<any>> {
    const { availableForCut, apenasFinais } = query;

    // Build dynamic baseWhere from query filters
    const baseWhere: any = {};
    if (availableForCut === 'true') {
      baseWhere.statusPlaca = 'DISPONIVEL';
    }
    if (apenasFinais === 'true') {
      baseWhere.placasDerivadas = { none: {} };
    }
    if ((query as any).tipoPlacaId) {
      baseWhere.tipoPlacaId = Number((query as any).tipoPlacaId);
    }

    // Map para strings amigáveis da interface (para statusExibicao)
    const mapStatusExibicao = (statusPlaca: string, statusProducao: string) => {
      if (statusPlaca === 'DISPONIVEL') {
        if (statusProducao === 'AGUARDANDO') return 'Aguardando';
        if (statusProducao === 'EM_PRODUCAO') return 'Em Produção';
        if (statusProducao === 'FINALIZADA') return 'Finalizada';
        return statusProducao;
      }
      if (statusPlaca === 'ALOCADA') return 'Alocada';
      if (statusPlaca === 'DESCARTADA') return 'Descartada';
      return statusPlaca;
    };

    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.placa,
      prismaClient: this.prisma,
      query,
      searchableFields: ['nome', 'descricao', 'tipoPlaca.nome'],
      numericSearchFields: ['id'],
      tableName: 'placas',
      baseWhere,
      customSearchEnhancer: (searchVal: string) => {
        const lower = searchVal.toLowerCase();
        const orConditions: any[] = [];

        // Match exato case-insensitive baseado no texto renderizado
        if ('aguardando'.includes(lower)) {
          orConditions.push({
            statusPlaca: 'DISPONIVEL',
            statusProducao: 'AGUARDANDO',
          });
        }
        if ('em produção'.includes(lower) || 'em producao'.includes(lower)) {
          orConditions.push({
            statusPlaca: 'DISPONIVEL',
            statusProducao: 'EM_PRODUCAO',
          });
        }
        if ('finalizada'.includes(lower)) {
          orConditions.push({
            statusPlaca: 'DISPONIVEL',
            statusProducao: 'FINALIZADA',
          });
        }
        if ('alocada'.includes(lower)) {
          orConditions.push({ statusPlaca: 'ALOCADA' });
        }
        if ('descartada'.includes(lower)) {
          orConditions.push({ statusPlaca: 'DESCARTADA' });
        }
        return orConditions;
      },
      orderByTranslator: (field, dir) => {
        if (field === 'statusExibicao') {
          // Ordena primeiro por placa, depois por produção (ou seja, Agrupando)
          return [{ statusPlaca: dir }, { statusProducao: dir }];
        }
        return null;
      },
      include: {
        tipoPlaca: {
          include: {
            materiais: { include: { materiaPrima: true } },
          },
        },
        _count: { select: { placasDerivadas: true } },
        formaCorte: true,
      },
      mapRow: (placa: any) => {
        // Dimensões vêm do tipoPlaca
        const largura = Number(placa.tipoPlaca?.largura || 0);
        const altura = Number(placa.tipoPlaca?.altura || 0);

        let dimensoes = `${formatDecimal(largura)} x ${formatDecimal(altura)}`;

        if (
          placa.formaCorte &&
          !GeometriaPlaca.eRetangulo(placa.formaCorte.percurso as VetorCorte[])
        ) {
          dimensoes = (placa.formaCorte.percurso as VetorCorte[])
            .map((p) => formatDecimal(p.distancia))
            .join(' x ');
        }

        return {
          ...placa,
          tipoPlacaNome: placa.tipoPlaca?.nome || 'N/A',
          statusExibicao: mapStatusExibicao(
            String(placa.statusPlaca),
            String(placa.statusProducao),
          ),
          nome: placa.nome,
          dimensoes,
          espessuraFormatada: formatDecimal(placa.tipoPlaca?.espessura || 0),
        };
      },
    });
  }

  // Endpoint para tab Estoque: agrupado por tipoPlacaId
  // Usa busca/ordenação em memória pois `quantidade` é um campo computado (_count)
  async findEstoqueDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    const skip = query.start || 0;
    const take = query.length || 10;

    // 1. Busca TODOS os tipos de placa (dataset pequeno) com contagem filtrada
    const allTipos = await this.prisma.tipoPlaca.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            placas: {
              where: {
                statusProducao: 'FINALIZADA',
                statusPlaca: 'DISPONIVEL',
                deletedAt: null,
                derivadaDePlacaId: null,
                placasDerivadas: { none: {} },
              },
            },
          },
        },
      },
    });

    const totalCount = allTipos.length;

    // 2. Mapeia para objetos planos (valores numéricos crus para ordenação)
    interface EstoqueRow {
      id: number;
      nome: string;
      largura: number;
      altura: number;
      quantidade: number;
      estoqueMinimo: number;
    }

    let data: EstoqueRow[] = allTipos.map((tipo) => ({
      id: tipo.id,
      nome: tipo.nome,
      largura: Number(tipo.largura),
      altura: Number(tipo.altura),
      quantidade: tipo._count.placas,
      estoqueMinimo: Number(tipo.estoqueMinimo || 0),
    }));

    // 3. Filtro de busca (em memória, suporta texto e numérico incluindo quantidade)
    const searchVal: string = String(query.search?.value ?? '');
    if (searchVal) {
      const lowerSearch = searchVal.toLowerCase();
      const isNumericSearch = /^[\d.,\s]+$/.test(searchVal.trim());
      const numericStr = isNumericSearch
        ? searchVal.replace(/[^0-9.,]/g, '').replace(',', '.')
        : null;

      data = data.filter((item) => {
        // Match textual em nome (case-insensitive)
        if (item.nome.toLowerCase().includes(lowerSearch)) return true;
        // Match numérico parcial em id, largura, altura, quantidade
        if (numericStr) {
          if (String(item.id).includes(numericStr)) return true;
          if (String(item.largura).includes(numericStr)) return true;
          if (String(item.altura).includes(numericStr)) return true;
          if (String(item.quantidade).includes(numericStr)) return true;
        }
        return false;
      });
    }

    const filteredCount = data.length;

    // 4. Ordenação (suporta qualquer campo, incluindo quantidade)
    const columns: DataTableColumnDto[] = query.columns ?? [];
    const orders: DataTableOrderDto[] = query.order ?? [];

    if (orders.length > 0 && columns.length > 0) {
      const orderConfig = orders[0];
      const colIdx = orderConfig.column;
      const column = colIdx !== undefined ? columns[colIdx] : undefined;
      const field = column?.data as keyof EstoqueRow | undefined;
      if (field && data.length > 0 && field in data[0]) {
        const dir = orderConfig.dir === 'desc' ? -1 : 1;
        data.sort((a, b) => {
          if (field === 'quantidade') {
            const isLowA = a.quantidade <= a.estoqueMinimo;
            const isLowB = b.quantidade <= b.estoqueMinimo;

            if (isLowA && !isLowB) return -1;
            if (!isLowA && isLowB) return 1;

            return (a.quantidade - b.quantidade) * dir;
          }

          const valA = a[field];
          const valB = b[field];
          if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * dir;
          }
          return String(valA).localeCompare(String(valB), 'pt-BR') * dir;
        });
      }
    } else {
      // Ordenação padrão: por nome
      data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }

    // 5. Paginação em memória
    const pagedData = data.slice(skip, skip + take);

    // 6. Formata campos numéricos para exibição (após ordenação)
    const formattedData: Record<string, unknown>[] = pagedData.map((item) => ({
      ...item,
      largura: formatDecimal(item.largura),
      altura: formatDecimal(item.altura),
    }));

    // 7. Filtra campos solicitados pelo DataTables
    const requestedFields = columns
      .map((c) => c.data)
      .filter(
        (d: string | undefined): d is string =>
          typeof d === 'string' && d !== 'null',
      );

    const finalData =
      requestedFields.length > 0
        ? formattedData.map((item) => {
            const result: Record<string, unknown> = {};
            for (const field of requestedFields) {
              if (item[field] !== undefined) result[field] = item[field];
            }
            return result;
          })
        : formattedData;

    return {
      draw: query.draw || 1,
      data: finalData,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
    };
  }

  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const placa = await prisma.placa.findUnique({
      where: { id },
      include: {
        tipoPlaca: {
          include: {
            materiais: {
              include: {
                materiaPrima: true,
              },
            },
          },
        },
        formaCorte: true,
      },
    });

    if (!placa) {
      throw new NotFoundException(`Placa com ID "${id}" não encontrada.`);
    }
    return placa;
  }

  async update(id: number, dto: UpdatePlacaDto) {
    const placaAntiga = await this.findOne(id);

    if (placaAntiga.statusPlaca === 'ALOCADA') {
      throw new BadRequestException(
        'Esta placa está ALOCADA a um requisito e não pode ser editada.',
      );
    }

    const { retalhoDescartado, ...updateData } = dto;

    const dataToUpdate: any = { ...updateData };

    if (retalhoDescartado !== undefined) {
      dataToUpdate.statusPlaca = retalhoDescartado
        ? 'DESCARTADA'
        : 'DISPONIVEL';
    }

    return this.prisma.placa.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: number) {
    const placa = await this.findOne(id);
    if (placa.statusPlaca === 'ALOCADA') {
      throw new BadRequestException(
        'Esta placa está ALOCADA a um requisito e não pode ser removida.',
      );
    }
    await this.prisma.placa.delete({ where: { id } });
    return { message: 'Placa removida com sucesso.' };
  }

  async gerenciarProducao(id: number, dto: GerenciarProducaoPlacaDto) {
    const { status, materiaisConsumidos } = dto;

    return this.prisma.$transaction(async (tx) => {
      const placa = await this.findOne(id, tx);

      if (status === 'EM_PRODUCAO') {
        if (placa.statusProducao !== 'AGUARDANDO') {
          throw new BadRequestException(
            'Apenas placas AGUARDANDO podem iniciar produção.',
          );
        }
        await tx.placa.update({
          where: { id },
          data: { statusProducao: 'EM_PRODUCAO' },
        });
      } else if (status === 'FINALIZADA') {
        if (placa.statusProducao === 'FINALIZADA') {
          throw new BadRequestException('Esta placa já está finalizada.');
        }

        // Se materiais consumidos foram passados, debita do estoque e registra
        if (
          materiaisConsumidos &&
          Object.keys(materiaisConsumidos).length > 0
        ) {
          for (const [materiaPrimaId, quantidade] of Object.entries(
            materiaisConsumidos,
          )) {
            const idMp = Number(materiaPrimaId);
            const mp = await tx.materiaPrima.findUnique({
              where: { id: idMp },
            });

            if (!mp || mp.quantidade < quantidade) {
              throw new BadRequestException(
                `Material insuficiente em estoque para debitar consumo real: ${mp?.item || idMp}`,
              );
            }

            await tx.materiaPrima.update({
              where: { id: idMp },
              data: { quantidade: { decrement: quantidade } },
            });
          }
        }

        await tx.placa.update({
          where: { id },
          data: {
            statusProducao: 'FINALIZADA',
            materiaisConsumidos:
              materiaisConsumidos || placa.materiaisConsumidos || {},
          },
        });
      }

      return this.findOne(id, tx);
    });
  }

  // ===== APLICAR CORTE EM PLACA =====

  async aplicarCorte(placaId: number, dto: AplicarCorteDto) {
    return this.prisma.$transaction(async (tx) => {
      const placa = await tx.placa.findUnique({
        where: { id: placaId },
        include: {
          tipoPlaca: true,
          placasDerivadas: { include: { formaCorte: true } },
        },
      });
      if (!placa) throw new NotFoundException('Placa não encontrada');

      const corte = await tx.corte.findUnique({ where: { id: dto.corteId } });
      if (!corte) throw new NotFoundException('Corte não encontrado');

      const percursoRot = this.rotacionarPercurso(
        corte.percurso as unknown as VetorCorte[],
        dto.rotacao,
      );
      const pontos = GeometriaPlaca.percursoParaPontos(
        { x: dto.origemX, y: dto.origemY },
        percursoRot,
      );
      const bbox = GeometriaPlaca.calcularBoundingBox(pontos);

      // Dimensões vêm do tipoPlaca
      const placaLargura = Number(placa.tipoPlaca.largura);
      const placaAltura = Number(placa.tipoPlaca.altura);

      if (
        bbox.x < 0 ||
        bbox.y < 0 ||
        bbox.x + bbox.width > placaLargura ||
        bbox.y + bbox.height > placaAltura
      ) {
        throw new BadRequestException(
          'O corte excede os limites físicos da placa.',
        );
      }

      for (const filha of placa.placasDerivadas) {
        if (filha.formaCorte?.pontos) {
          const pontosFilha = GeometriaPlaca.percursoParaPontos(
            {
              x: Number(filha.corteOrigemX || 0),
              y: Number(filha.corteOrigemY || 0),
            },
            this.rotacionarPercurso(
              filha.formaCorte.percurso as unknown as VetorCorte[],
              filha.corteRotacao || 0,
            ),
          );
          if (GeometriaPlaca.detectarSobreposicao(pontos, pontosFilha)) {
            throw new BadRequestException(
              `O corte sobrepõe um corte já aplicado: ${filha.nome}`,
            );
          }
        }
      }

      // Gerar nome automático PXCY
      const numFilhas = placa.placasDerivadas.length;
      const nomePlacaFilha = `P${placa.id}C${numFilhas + 1}`;

      return tx.placa.create({
        data: {
          nome: nomePlacaFilha,
          descricao: `Gerada por corte "${corte.nome}" na placa ${placa.nome}`,
          tipoPlacaId: placa.tipoPlacaId,
          derivadaDePlacaId: placa.id,
          formaCorteId: corte.id,
          corteOrigemX: dto.origemX,
          corteOrigemY: dto.origemY,
          corteRotacao: dto.rotacao,
          statusProducao: 'FINALIZADA',
        },
      });
    });
  }

  async findCortesAplicados(placaId: number) {
    const placa = await this.prisma.placa.findUnique({
      where: { id: placaId },
      include: {
        placasDerivadas: {
          where: { formaCorteId: { not: null } },
          include: { formaCorte: true },
        },
      },
    });
    if (!placa) throw new NotFoundException('Placa não encontrada.');
    return placa.placasDerivadas;
  }

  async removerCorteAplicado(placaFilhaId: number) {
    const filha = await this.prisma.placa.findUnique({
      where: { id: placaFilhaId },
    });
    if (!filha || !filha.formaCorteId)
      throw new NotFoundException('Placa filha de corte não encontrada.');
    await this.prisma.placa.delete({ where: { id: placaFilhaId } });
    return { success: true };
  }

  async updateStatusPlaca(id: number, statusPlaca: string) {
    const placa = await this.findOne(id);
    if (placa.statusPlaca === 'ALOCADA') {
      throw new BadRequestException(
        'Esta placa está ALOCADA e seu status não pode ser alterado manualmente.',
      );
    }
    return this.prisma.placa.update({
      where: { id },
      data: { statusPlaca: statusPlaca as any },
    });
  }

  private rotacionarPercurso(
    percurso: VetorCorte[],
    rotacao: number,
  ): VetorCorte[] {
    if (rotacao === 0) return percurso;
    const steps = (((rotacao % 360) + 360) % 360) / 90;
    const rotMap: Record<string, string[]> = {
      UP: ['UP', 'RIGHT', 'DOWN', 'LEFT'],
      RIGHT: ['RIGHT', 'DOWN', 'LEFT', 'UP'],
      DOWN: ['DOWN', 'LEFT', 'UP', 'RIGHT'],
      LEFT: ['LEFT', 'UP', 'RIGHT', 'DOWN'],
    };
    return percurso.map((v) => ({
      ...v,
      direcao: (rotMap[v.direcao]?.[steps] || v.direcao) as DirecaoCorte,
    }));
  }
}
