import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataTableResult } from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { getIdsByNumericPartialMatch } from '../common/utils/prisma-search.utils';
import { PrismaService } from '../prisma/prisma.service';
import { AplicarCorteDto } from './dto/aplicar-corte.dto';
import { CreatePlacaBatchDto } from './dto/create-placa-batch.dto';
import { CreatePlacaDto } from './dto/create-placa.dto';
import { GerenciarProducaoPlacaDto } from './dto/gerenciar-producao-placa.dto';
import { PlacaQueryDto } from './dto/placa-query.dto';
import { UpdatePlacaDto } from './dto/update-placa.dto';
import { GeometriaPlaca } from './utils/geometria.utils';

@Injectable()
export class PlacasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlacaDto) {
    const { materiais, darBaixaImediata, retalhoDescartado, ...placaData } =
      dto;

    return this.prisma.$transaction(async (tx) => {
      const placa = await tx.placa.create({
        data: {
          ...placaData,
          statusProducao: darBaixaImediata ? 'FINALIZADA' : 'AGUARDANDO',
          statusPlaca: retalhoDescartado ? 'DESCARTADA' : 'DISPONIVEL',
        },
      });

      if (materiais && materiais.length > 0) {
        await tx.materialPlaca.createMany({
          data: materiais.map((m) => ({
            placaId: placa.id,
            materiaPrimaId: m.materiaPrimaId,
            quantidade: m.quantidade,
          })),
        });

        if (darBaixaImediata) {
          const consumos: Record<string, number> = {};
          for (const m of materiais) {
            const mp = await tx.materiaPrima.findUnique({
              where: { id: m.materiaPrimaId },
            });
            if (!mp || mp.quantidade < m.quantidade) {
              throw new BadRequestException(
                `Material insuficiente para a baixa imediata: ${mp?.item || m.materiaPrimaId}`,
              );
            }
            await tx.materiaPrima.update({
              where: { id: m.materiaPrimaId },
              data: { quantidade: { decrement: m.quantidade } },
            });
            consumos[m.materiaPrimaId.toString()] = m.quantidade;
          }
          await tx.placa.update({
            where: { id: placa.id },
            data: { materiaisConsumidos: consumos },
          });
        }
      }

      return this.findOne(placa.id, tx);
    });
  }

  async createBatch(dto: CreatePlacaBatchDto) {
    const {
      prefixo = '',
      sufixo = '',
      valorInicial,
      quantidade,
      algarismos,
      materiais,
      darBaixaImediata,
      retalhoDescartado,
      ...placaDataBase
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      let currentPadding = algarismos || valorInicial.toString().length;
      let valoresEncontrados: number[] = [];
      let valorDeBusca = valorInicial;

      // Loop principal para encontrar a quantidade necessária
      while (valoresEncontrados.length < quantidade) {
        const paddingNecessarioIdx = valorDeBusca.toString().length;

        // Se o valor de busca atual exigir mais dígitos que o padding atual,
        // precisamos atualizar o padding e reiniciar a busca para garantir consistência em todo o lote.
        if (paddingNecessarioIdx > currentPadding && !algarismos) {
          currentPadding = paddingNecessarioIdx;
          valoresEncontrados = [];
          valorDeBusca = valorInicial;
          continue;
        }

        const nomeCandidato = `${prefixo}${valorDeBusca
          .toString()
          .padStart(currentPadding, '0')}${sufixo}`;

        const existe = await tx.placa.findFirst({
          where: { nome: nomeCandidato, deletedAt: null },
        });

        if (!existe) {
          valoresEncontrados.push(valorDeBusca);
        }

        valorDeBusca++;
      }

      // Agora criamos as placas com os nomes finais garantidos
      const resultados = [];
      for (const v of valoresEncontrados) {
        const nomeFinal = `${prefixo}${v
          .toString()
          .padStart(currentPadding, '0')}${sufixo}`;

        const placa = await tx.placa.create({
          data: {
            ...placaDataBase,
            nome: nomeFinal,
            statusProducao: darBaixaImediata ? 'FINALIZADA' : 'AGUARDANDO',
            statusPlaca: retalhoDescartado ? 'DESCARTADA' : 'DISPONIVEL',
          },
        });

        if (materiais && materiais.length > 0) {
          await tx.materialPlaca.createMany({
            data: materiais.map((m) => ({
              placaId: placa.id,
              materiaPrimaId: m.materiaPrimaId,
              quantidade: m.quantidade,
            })),
          });

          if (darBaixaImediata) {
            const consumos: Record<string, number> = {};
            for (const m of materiais) {
              const mp = await tx.materiaPrima.findUnique({
                where: { id: m.materiaPrimaId },
              });
              if (!mp || mp.quantidade < m.quantidade) {
                throw new BadRequestException(
                  `Material insuficiente para a baixa imediata no lote: ${mp?.item || m.materiaPrimaId}`,
                );
              }
              await tx.materiaPrima.update({
                where: { id: m.materiaPrimaId },
                data: { quantidade: { decrement: m.quantidade } },
              });
              consumos[m.materiaPrimaId.toString()] = m.quantidade;
            }
            await tx.placa.update({
              where: { id: placa.id },
              data: { materiaisConsumidos: consumos },
            });
          }
        }
        resultados.push(placa);
      }

      return {
        message: `${quantidade} placas criadas com sucesso (Padding: ${currentPadding}).`,
        ids: resultados.map((r) => r.id),
      };
    });
  }

  async findAll() {
    return this.prisma.placa.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findDatatable(query: PlacaQueryDto): Promise<DataTableResult<any>> {
    const { availableForCut, apenasFinais } = query;
    const {
      skip,
      take,
      where: generatedWhere,
      orderBy,
    } = PrismaDatatableHelper.buildPrismaQuery(query, [
      'nome',
      'descricao',
      'materiaisPlaca.some.materiaPrima.item',
    ]);
    let finalWhere = { ...generatedWhere };
    if (availableForCut === 'true') {
      finalWhere.statusPlaca = 'DISPONIVEL';
    }
    if (apenasFinais === 'true') {
      finalWhere.placasDerivadas = { none: {} };
    }
    if (query.search?.value) {
      const searchVal = query.search.value;
      const idsByValues = await getIdsByNumericPartialMatch(
        this.prisma,
        'placas',
        ['id'],
        searchVal,
      );
      if (idsByValues.length > 0) {
        if (finalWhere.OR) {
          finalWhere.OR.push({
            id: { in: idsByValues.map((id) => Number(id)) },
          });
        } else {
          finalWhere.OR = [{ id: { in: idsByValues.map((id) => Number(id)) } }];
        }
      }
    }
    const [dataRaw, total, filtered] = await Promise.all([
      this.prisma.placa.findMany({
        where: finalWhere,
        skip,
        take,
        orderBy: Object.keys(orderBy).length ? orderBy : { id: 'desc' },
        include: {
          materiaisPlaca: { include: { materiaPrima: true } },
          _count: { select: { placasDerivadas: true } },
          tramaEsquerda: true,
          tramaDireita: true,
          tramaSuperior: true,
          tramaInferior: true,
          formaCorte: true,
        },
      }),
      this.prisma.placa.count(),
      this.prisma.placa.count({ where: finalWhere }),
    ]);
    const requestedFields = (query.columns
      ?.map((c) => c.data)
      .filter((d) => d && d !== 'null') || []) as string[];
    const data = dataRaw.map((placa: any) => {
      const dimensoes = `${Number(placa.largura).toFixed(2)} x ${Number(placa.altura).toFixed(2)}`;
      const flatObj: any = {
        ...placa,
        nome: placa.formaCorteId ? `${placa.nome} (Corte)` : placa.nome,
        dimensoes,
        espessuraFormatada: `${placa.espessura || 0}`,
      };
      if (requestedFields.length === 0) return flatObj;
      const result: any = {};
      requestedFields.forEach((field) => {
        if (flatObj[field] !== undefined) result[field] = flatObj[field];
      });
      return result;
    });
    return {
      draw: query.draw || 1,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const placa = await prisma.placa.findUnique({
      where: { id },
      include: {
        materiaisPlaca: {
          include: {
            materiaPrima: true,
          },
        },
        tramaEsquerda: true,
        tramaDireita: true,
        tramaSuperior: true,
        tramaInferior: true,
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
    const {
      materiais,
      ajustarEstoqueConsumido,
      darBaixaImediata,
      retalhoDescartado,
      ...placaData
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      const dataToUpdate: any = { ...placaData };
      if (retalhoDescartado !== undefined) {
        dataToUpdate.statusPlaca = retalhoDescartado
          ? 'DESCARTADA'
          : 'DISPONIVEL';
      }

      const updatedPlaca = await tx.placa.update({
        where: { id },
        data: dataToUpdate,
      });

      if (materiais) {
        if (ajustarEstoqueConsumido && placaAntiga.status === 'FINALIZADA') {
          // Calculate delta and adjust stock
          const antigosMap = new Map();
          placaAntiga.materiaisPlaca.forEach((m: any) =>
            antigosMap.set(m.materiaPrimaId, m.quantidade),
          );

          for (const m of materiais) {
            const antigoQty = antigosMap.get(m.materiaPrimaId) || 0;
            const delta = m.quantidade - antigoQty;

            if (delta > 0) {
              const mp = await tx.materiaPrima.findUnique({
                where: { id: m.materiaPrimaId },
              });
              if (!mp || mp.quantidade < delta) {
                throw new BadRequestException(
                  `Material insuficiente para o ajuste de estoque: ${mp?.item || m.materiaPrimaId}`,
                );
              }
              await tx.materiaPrima.update({
                where: { id: m.materiaPrimaId },
                data: { quantidade: { decrement: delta } },
              });
            } else if (delta < 0) {
              await tx.materiaPrima.update({
                where: { id: m.materiaPrimaId },
                data: { quantidade: { increment: Math.abs(delta) } },
              });
            }
            antigosMap.delete(m.materiaPrimaId);
          }

          // Any remaining materials in antigosMap were removed, so we return them to stock
          for (const [mpId, antigoQty] of antigosMap.entries()) {
            await tx.materiaPrima.update({
              where: { id: mpId },
              data: { quantidade: { increment: antigoQty } },
            });
          }
        }

        // Delete existing materials and create new ones
        await tx.materialPlaca.deleteMany({ where: { placaId: id } });
        if (materiais.length > 0) {
          await tx.materialPlaca.createMany({
            data: materiais.map((m) => ({
              placaId: id,
              materiaPrimaId: m.materiaPrimaId,
              quantidade: m.quantidade,
            })),
          });
        }
      }

      return this.findOne(id, tx);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
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

  async baixaProducao(id: number, dto: { quantidade: number }) {
    const { quantidade } = dto;

    return this.prisma.$transaction(async (tx) => {
      const placa = await this.findOne(id, tx);

      // Verificar se há material em estoque
      for (const materiaisPlaca of placa.materiaisPlaca) {
        const materiaPrima = await tx.materiaPrima.findUnique({
          where: { id: materiaisPlaca.materiaPrimaId },
        });

        if (
          !materiaPrima ||
          materiaPrima.quantidade < materiaisPlaca.quantidade * quantidade
        ) {
          throw new BadRequestException(
            `Material insuficiente em estoque: ${materiaisPlaca.materiaPrima.item}`,
          );
        }
      }

      // Debitar materiais do estoque
      for (const materiaisPlaca of placa.materiaisPlaca) {
        await tx.materiaPrima.update({
          where: { id: materiaisPlaca.materiaPrimaId },
          data: {
            quantidade: {
              decrement: materiaisPlaca.quantidade * quantidade,
            },
          },
        });
      }

      // Atualizar status para finalizada
      await tx.placa.update({
        where: { id },
        data: {
          statusProducao: 'FINALIZADA',
        },
      });

      return this.findOne(id, tx);
    });
  }

  // ===== APLICAR CORTE EM PLACA =====

  async aplicarCorte(placaId: number, dto: AplicarCorteDto) {
    return this.prisma.$transaction(async (tx) => {
      const placa = await tx.placa.findUnique({
        where: { id: placaId },
        include: { placasDerivadas: { include: { formaCorte: true } } },
      });
      if (!placa) throw new NotFoundException('Placa não encontrada');

      const corte = await tx.corte.findUnique({ where: { id: dto.corteId } });
      if (!corte) throw new NotFoundException('Corte não encontrado');

      const percursoRot = this.rotacionarPercurso(
        corte.percurso as any[],
        dto.rotacao,
      );
      const pontos = GeometriaPlaca.percursoParaPontos(
        { x: dto.origemX, y: dto.origemY },
        percursoRot,
      );
      const bbox = GeometriaPlaca.calcularBoundingBox(pontos);

      if (
        bbox.x < 0 ||
        bbox.y < 0 ||
        bbox.x + bbox.width > Number(placa.largura) ||
        bbox.y + bbox.height > Number(placa.altura)
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
              filha.formaCorte.percurso as any[],
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

      return tx.placa.create({
        data: {
          nome: dto.nomePlacaFilha,
          descricao: `Gerada por corte "${corte.nome}" na placa ${placa.nome}`,
          largura: bbox.width,
          altura: bbox.height,
          espessura: placa.espessura,
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
    await this.findOne(id);
    return this.prisma.placa.update({
      where: { id },
      data: { statusPlaca: statusPlaca as any },
    });
  }

  private rotacionarPercurso(percurso: any[], rotacao: number): any[] {
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
      direcao: rotMap[v.direcao]?.[steps] || v.direcao,
    }));
  }
}
