import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientesService } from '../clientes/clientes.service';
import { EntregasService } from '../entregas/entregas.service';
import {
  Prisma,
  StatusPagamentoVenda,
  StatusProducao,
  StatusVenda,
} from '../generated/prisma/client';
import { GeometriaPlaca } from '../placas/utils/geometria.utils';
import { PrismaService } from '../prisma/prisma.service';
import { BulkAlocacaoDto } from './dto/bulk-alocacao.dto';
import { CreateInternalOrderDto } from './dto/create-internal-order.dto';
import { UpdateOrdemProducaoDto } from './dto/update-ordem-producao.dto';

const includeRelations = {
  venda: {
    include: {
      cliente: true,
      modeloCasa: {
        include: {
          materiaisModeloCasa: {
            include: {
              materiaPrima: true,
            },
          },
          requisitos: {
            include: {
              corte: true,
            },
          },
        },
      },
      vendaItensOverride: {
        include: {
          materiaPrima: true,
        },
      },
      vendaRequisitos: {
        include: {
          corte: true,
          placaAlocada: true,
          tramaEsquerda: true,
          tramaDireita: true,
          tramaSuperior: true,
          tramaInferior: true,
        },
      },
    },
  },
  ordensProducaoHistorico: { orderBy: { dataAlteracao: 'asc' } },
} as const;

import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import {
  buildSearchFilter,
  getIdsByNumericPartialMatch,
} from '../common/utils/prisma-search.utils';

@Injectable()
export class ProducaoService {
  constructor(
    private prisma: PrismaService,
    private entregasService: EntregasService,
    private clientesService: ClientesService,
  ) {}

  findAll() {
    return this.prisma.ordemProducao.findMany({
      orderBy: { id: 'desc' },
      include: includeRelations,
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    const { start = 0, length = 10, search } = query;
    const skip = start;
    const limit = length;

    const baseWhere: any = {};
    let where = { ...baseWhere };

    if (search && search.value) {
      // Busca em IDs de venda e IDs de ordem
      const idsByOrder = await getIdsByNumericPartialMatch(
        this.prisma,
        'ordens_producao',
        ['id', 'venda_id'],
        search.value,
      );

      const searchFilter = buildSearchFilter(search.value, [
        'venda.cliente.nome',
        'venda.modeloCasa.nome',
        'status',
      ]);

      if (idsByOrder.length > 0) {
        if (searchFilter.OR) {
          searchFilter.OR.push({ id: { in: idsByOrder } });
        } else {
          searchFilter.OR = [{ id: { in: idsByOrder } }];
        }
      }

      where = { ...baseWhere, ...searchFilter };
    }

    const [data, total, filtered] = await Promise.all([
      this.prisma.ordemProducao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: includeRelations,
      }),
      this.prisma.ordemProducao.count({ where: baseWhere }),
      this.prisma.ordemProducao.count({ where }),
    ]);

    const requestedFields = (query.columns
      ?.map((c) => c.data)
      .filter((d) => d && d !== 'null') || []) as string[];

    const finalData = data.map((ordem: any) => {
      const flatObj: any = {
        id: ordem.id,
        status: ordem.status,
        dataAgendamento: ordem.dataAgendamento,
        vendaId: ordem.venda?.id || null,
        clienteNome: ordem.venda?.cliente?.nome || 'N/A',
        modeloNome: ordem.venda?.modeloCasa?.nome || 'N/A',
        venda: ordem.venda,
        ordensProducaoHistorico: ordem.ordensProducaoHistorico,
      };

      if (requestedFields.length === 0) return flatObj;

      const result: any = {};
      requestedFields.forEach((field) => {
        if (flatObj[field] !== undefined) {
          result[field] = flatObj[field];
        }
      });
      return result;
    });

    return {
      draw: query.draw || 1,
      data: finalData,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async findOne(id: number, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    const ordem = await prisma.ordemProducao.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!ordem) {
      throw new NotFoundException(
        `Ordem de produção com ID ${id} não encontrada.`,
      );
    }
    return ordem;
  }

  async createInternalOrder(dto: CreateInternalOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const internalClient =
        await this.clientesService.findOrCreateInternalClient();

      const modelo = await tx.modeloCasa.findUnique({
        where: { id: dto.modeloId },
      });

      if (!modelo) {
        throw new NotFoundException(
          `Modelo de casa com ID ${dto.modeloId} não encontrado.`,
        );
      }

      const internalVenda = await tx.venda.create({
        data: {
          clienteId: internalClient.id,
          modeloId: modelo.id,
          dataVenda: new Date(),
          preco: modelo.preco,
          enderecoEntrega: 'Uso Interno',
          status: StatusVenda.PRODUCAO_AGENDADA,
          statusPagamento: StatusPagamentoVenda.PAGO,
          isInternal: true,
          suprimentosObra: (modelo.suprimentosObra || []) as any,
        },
      });

      // Busca os requisitos do modelo para clonar para a venda
      const modeloComRequisitos = await tx.modeloCasa.findUnique({
        where: { id: modelo.id },
        include: { requisitos: true },
      });

      if (
        modeloComRequisitos?.requisitos &&
        modeloComRequisitos.requisitos.length > 0
      ) {
        await tx.vendaRequisito.createMany({
          data: modeloComRequisitos.requisitos.map((r: any) => ({
            vendaId: internalVenda.id,
            tipo: r.tipo,
            alias: r.alias,
            parede: r.parede,
            largura: r.largura,
            altura: r.altura,
            espessura: r.espessura,
            tramaEsquerdaId: r.tramaEsquerdaId,
            tramaDireitaId: r.tramaDireitaId,
            tramaSuperiorId: r.tramaSuperiorId,
            tramaInferiorId: r.tramaInferiorId,
            corteId: r.corteId,
          })),
        });
      }

      const novaOrdemProducao = await tx.ordemProducao.create({
        data: {
          vendaId: internalVenda.id,
          status: StatusProducao.MATERIAIS_PENDENTES,
        },
      });

      await tx.ordemProducaoHistorico.create({
        data: {
          ordemProducaoId: novaOrdemProducao.id,
          statusNovo: novaOrdemProducao.status,
          notas: 'Ordem de produção interna.',
        },
      });

      return this.findOne(novaOrdemProducao.id, tx);
    });
  }

  async updateStatus(id: number, dto: UpdateOrdemProducaoDto) {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await this.findOne(id, tx);
      if (!ordem) {
        throw new NotFoundException(
          `Ordem de produção com ID ${id} não encontrada.`,
        );
      }
      if (ordem.status === dto.status) return ordem; // Nenhuma alteração necessária

      // Impede a alteração para PRONTO_PARA_ENVIO por este método
      if (dto.status === StatusProducao.PRONTO_PARA_ENVIO) {
        throw new ConflictException(
          'Utilize a ação "Finalizar Produção" para alterar o status para PRONTO_PARA_ENVIO.',
        );
      }

      // LÓGICA DE ALOCAÇÃO DE ESTOQUE
      if (
        ordem.status === StatusProducao.MATERIAIS_PENDENTES &&
        dto.status === StatusProducao.EM_ESPERA
      ) {
        if (!ordem.venda.modeloCasa) {
          throw new ConflictException(
            `Não é possível alocar materiais pois a venda ou o modelo de casa associado não foram encontrados.`,
          );
        }

        const { materiaisModeloCasa } = ordem.venda.modeloCasa;

        // 1. Validar estoque de materiais
        for (const item of materiaisModeloCasa) {
          if (item.materiaPrima.quantidade < item.qtModelo) {
            throw new ConflictException(
              `Estoque insuficiente para o material "${item.materiaPrima.item}".`,
            );
          }
        }

        // 2. Debitar estoque de materiais
        for (const item of materiaisModeloCasa) {
          await tx.materiaPrima.update({
            where: { id: item.materiaPrimaId },
            data: { quantidade: { decrement: item.qtModelo } },
          });
        }

        // Nota: A alocação de placas físicas é feita separadamente na tela de produção
      }

      // Atualiza a ordem de produção
      const ordemAtualizada = await tx.ordemProducao.update({
        where: { id },
        data: {
          status: dto.status,
          dataAgendamento: dto.dataAgendamento
            ? new Date(dto.dataAgendamento)
            : ordem.dataAgendamento,
        },
      });

      // Adiciona o registro no histórico
      await tx.ordemProducaoHistorico.create({
        data: {
          ordemProducaoId: id,
          statusAnterior: ordem.status,
          statusNovo: dto.status,
          notas: dto.notas,
        },
      });

      // Mapeamento e atualização do status da Venda (sincronização)
      let novoStatusVenda:
        | import('../generated/prisma/client').StatusVenda
        | null = null;
      if (dto.status === StatusProducao.AGENDADO)
        novoStatusVenda = 'PRODUCAO_AGENDADA';
      else if (dto.status === StatusProducao.MATERIAIS_PENDENTES)
        novoStatusVenda = 'AGUARDANDO_AGENDAMENTO_PRODUCAO';
      else if (
        dto.status === StatusProducao.PREPARANDO_MATERIAIS ||
        dto.status === StatusProducao.EM_ESPERA
      )
        novoStatusVenda = 'MATERIAIS_ALOCADOS';
      else if (dto.status === StatusProducao.MONTANDO_KIT)
        novoStatusVenda = 'KIT_EM_PREPARACAO';
      else if (dto.status === StatusProducao.CANCELADO)
        novoStatusVenda = 'CANCELADA';

      if (novoStatusVenda && ordem.vendaId) {
        // O TS do prisma pode acusar se pegarmos o enum direto de venda, faremos o query
        const vendaAtual = await tx.venda.findUnique({
          where: { id: ordem.vendaId },
        });
        if (vendaAtual && vendaAtual.status !== novoStatusVenda) {
          await tx.venda.update({
            where: { id: ordem.vendaId },
            data: { status: novoStatusVenda },
          });
          await tx.vendaHistorico.create({
            data: {
              vendaId: ordem.vendaId,
              statusAnterior: vendaAtual.status,
              statusNovo: novoStatusVenda,
            },
          });
        }
      }

      return ordemAtualizada;
    });
  }

  async finalizarProducao(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await this.findOne(id, tx);
      if (!ordem) {
        throw new NotFoundException(
          `Ordem de produção com ID ${id} não encontrada.`,
        );
      }
      if (ordem.status === StatusProducao.PRONTO_PARA_ENVIO) {
        return ordem; // Ação idempotente
      }
      if (ordem.status === StatusProducao.MATERIAIS_PENDENTES) {
        throw new ConflictException(
          'A produção precisa ser iniciada antes de ser finalizada.',
        );
      }

      // LÓGICA DE INTEGRAÇÃO: Cria a entrega automaticamente
      if (!ordem.venda) {
        throw new ConflictException(
          'Não é possível criar a entrega: a venda associada não foi encontrada.',
        );
      }

      const entregaExistente = await tx.entrega.findUnique({
        where: { vendaId: ordem.vendaId },
      });

      if (!entregaExistente) {
        await this.entregasService.create({
          vendaId: ordem.vendaId,
          enderecoEntrega: ordem.venda.enderecoEntrega,
          previsaoEntrega: new Date(
            new Date().setDate(new Date().getDate() + 7),
          ).toISOString(),
        });
      }

      const ordemAtualizada = await tx.ordemProducao.update({
        where: { id },
        data: { status: StatusProducao.PRONTO_PARA_ENVIO },
      });

      await tx.ordemProducaoHistorico.create({
        data: {
          ordemProducaoId: id,
          statusAnterior: ordem.status,
          statusNovo: StatusProducao.PRONTO_PARA_ENVIO,
          notas: 'Produção finalizada e pronta para envio.',
        },
      });

      // Atualiza o status da Venda associada para PRONTO_PARA_ENVIO
      const vendaAtual = await tx.venda.findUnique({
        where: { id: ordem.vendaId },
      });
      if (vendaAtual && vendaAtual.status !== 'PRONTO_PARA_ENVIO') {
        await tx.venda.update({
          where: { id: ordem.vendaId },
          data: { status: 'PRONTO_PARA_ENVIO' },
        });
        await tx.vendaHistorico.create({
          data: {
            vendaId: ordem.vendaId,
            statusAnterior: vendaAtual.status,
            statusNovo: 'PRONTO_PARA_ENVIO',
          },
        });
      }

      return ordemAtualizada;
    });
  }

  async findCompatiblePlates(requisitoId: number) {
    const req = await this.prisma.vendaRequisito.findUnique({
      where: { id: requisitoId },
      include: { corte: true },
    });
    if (!req) throw new NotFoundException('Requisito não encontrado');

    const isCorte = req.tipo === 'CORTE_ESPECIFICO';
    const percurso = isCorte ? (req.corte?.percurso as any[]) : null;

    const reqW = Number(req.largura || 0);
    const reqH = Number(req.altura || 0);
    const reqTramas = {
      L: req.tramaEsquerdaId,
      R: req.tramaDireitaId,
      T: req.tramaSuperiorId,
      B: req.tramaInferiorId,
    };

    // Um requisito é considerado "retangular" se for PLACA_LISA ou se o corte for retangular.
    // Se for retangular, permitimos troca de lados (simetria) e rotação.
    let isRetangular = !isCorte;
    if (isCorte && percurso) {
      isRetangular = GeometriaPlaca.eRetangulo(percurso);
      // Fallback: se o percurso não for estritamente retangular (ex: fechamento redundante),
      // mas as dimensões do requisito batem com o que foi informado, tratamos como retangular.
      if (!isRetangular && reqW > 0 && reqH > 0) {
        // Se temos largura/altura e o percurso tem pelo menos 4 pontos, consideramos retangular para fins de simetria
        if (percurso.length >= 4) isRetangular = true;
      }
    }

    const placas = await this.prisma.placa.findMany({
      where: {
        statusPlaca: 'DISPONIVEL',
        statusProducao: 'FINALIZADA',
        deletedAt: null,
      },
    });

    const normalizeTrama = (val: any) => {
      if (val === null || val === undefined) return 0;
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };

    const compareSets = (set1: any[], set2: any[]) => {
      const s1 = set1.map(normalizeTrama).sort((a, b) => a - b);
      const s2 = set2.map(normalizeTrama).sort((a, b) => a - b);
      return s1[0] === s2[0] && s1[1] === s2[1];
    };

    const results = placas.filter((p) => {
      const pW = Number(p.largura || 0);
      const pH = Number(p.altura || 0);
      const pTramas = {
        L: p.tramaEsquerdaAtiva ? p.tramaEsquerdaId : null,
        R: p.tramaDireitaAtiva ? p.tramaDireitaId : null,
        T: p.tramaSuperiorAtiva ? p.tramaSuperiorId : null,
        B: p.tramaInferiorAtiva ? p.tramaInferiorId : null,
      };

      if (isRetangular) {
        // Opção 1: Dimensões Batem (0º ou 180º ou Flip)
        if (Math.abs(pW - reqW) < 0.1 && Math.abs(pH - reqH) < 0.1) {
          const horizMatch = compareSets(
            [pTramas.L, pTramas.R],
            [reqTramas.L, reqTramas.R],
          );
          const vertMatch = compareSets(
            [pTramas.T, pTramas.B],
            [reqTramas.T, reqTramas.B],
          );
          if (horizMatch && vertMatch) return true;
        }

        // Opção 2: Dimensões Invertidas (90º ou 270º)
        if (Math.abs(pW - reqH) < 0.1 && Math.abs(pH - reqW) < 0.1) {
          // Horizontal da placa (L/R) vs Vertical do requisito (T/B)
          const horizMatch = compareSets(
            [pTramas.L, pTramas.R],
            [reqTramas.T, reqTramas.B],
          );
          // Vertical da placa (T/B) vs Horizontal do requisito (L/R)
          const vertMatch = compareSets(
            [pTramas.T, pTramas.B],
            [reqTramas.L, reqTramas.R],
          );
          if (horizMatch && vertMatch) return true;
        }
      } else {
        // CORTE COMPLEXO: Exige mesmo ID de corte e tramas nas posições exatas
        if (p.formaCorteId !== req.corteId) return false;
        const match =
          normalizeTrama(pTramas.L) === normalizeTrama(reqTramas.L) &&
          normalizeTrama(pTramas.R) === normalizeTrama(reqTramas.R) &&
          normalizeTrama(pTramas.T) === normalizeTrama(reqTramas.T) &&
          normalizeTrama(pTramas.B) === normalizeTrama(reqTramas.B);
        return match;
      }

      return false;
    });

    return results;
  }

  async bulkAlocar(dto: BulkAlocacaoDto) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.itens) {
        if (item.placaId) {
          // Reutiliza a lógica de alocação
          const req = await tx.vendaRequisito.findUnique({
            where: { id: item.requisitoId },
          });
          if (!req)
            throw new NotFoundException(
              `Requisito #${item.requisitoId} não encontrado`,
            );

          const placa = await tx.placa.findUnique({
            where: { id: item.placaId },
          });
          if (!placa)
            throw new NotFoundException(
              `Placa #${item.placaId} não encontrada`,
            );
          if (
            placa.statusPlaca !== 'DISPONIVEL' &&
            req.placaAlocadaId !== item.placaId
          ) {
            throw new ConflictException(
              `A placa #${item.placaId} não está disponível para alocação.`,
            );
          }

          // Desaloca placa anterior se existir e for diferente
          if (req.placaAlocadaId && req.placaAlocadaId !== item.placaId) {
            await tx.placa.update({
              where: { id: req.placaAlocadaId },
              data: { statusPlaca: 'DISPONIVEL' },
            });
          }

          // Aloca a nova
          await tx.placa.update({
            where: { id: item.placaId },
            data: { statusPlaca: 'ALOCADA' },
          });
          await tx.vendaRequisito.update({
            where: { id: item.requisitoId },
            data: { placaAlocadaId: item.placaId },
          });
        } else {
          // Lógica de desalocação
          const req = await tx.vendaRequisito.findUnique({
            where: { id: item.requisitoId },
          });
          if (req?.placaAlocadaId) {
            await tx.placa.update({
              where: { id: req.placaAlocadaId },
              data: { statusPlaca: 'DISPONIVEL' },
            });
            await tx.vendaRequisito.update({
              where: { id: item.requisitoId },
              data: { placaAlocadaId: null },
            });
          }
        }
      }
      return { success: true, count: dto.itens.length };
    });
  }

  async alocarPlaca(requisitoId: number, placaId: number) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.vendaRequisito.findUnique({
        where: { id: requisitoId },
      });
      if (!req) throw new NotFoundException('Requisito não encontrado');

      const placa = await tx.placa.findUnique({ where: { id: placaId } });
      if (!placa) throw new NotFoundException('Placa não encontrada');
      if (placa.statusPlaca !== 'DISPONIVEL') {
        throw new ConflictException(
          'Esta placa não está disponível para alocação.',
        );
      }

      // Desaloca placa anterior se existir
      if (req.placaAlocadaId) {
        await tx.placa.update({
          where: { id: req.placaAlocadaId },
          data: { statusPlaca: 'DISPONIVEL' },
        });
      }

      // Aloca nova placa
      await tx.vendaRequisito.update({
        where: { id: requisitoId },
        data: { placaAlocadaId: placaId },
      });

      await tx.placa.update({
        where: { id: placaId },
        data: { statusPlaca: 'ALOCADA' },
      });

      return { success: true };
    });
  }

  async desalocarPlaca(requisitoId: number) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.vendaRequisito.findUnique({
        where: { id: requisitoId },
      });
      if (!req || !req.placaAlocadaId) return { success: true };

      await tx.placa.update({
        where: { id: req.placaAlocadaId },
        data: { statusPlaca: 'DISPONIVEL' },
      });

      await tx.vendaRequisito.update({
        where: { id: requisitoId },
        data: { placaAlocadaId: null },
      });

      return { success: true };
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Garante que a ordem existe
    return this.prisma.ordemProducao.delete({
      where: { id },
    });
  }
}
