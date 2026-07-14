import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientesService } from '../clientes/clientes.service';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { EntregasService } from '../entregas/entregas.service';
import {
  Prisma,
  StatusPagamentoVenda,
  StatusPlaca,
  StatusProducao,
  StatusProducaoPlaca,
  StatusVenda,
} from '../generated/prisma/client';
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
          tipoPlaca: {
            include: {
              tramaEsquerda: true,
              tramaDireita: true,
              tramaSuperior: true,
              tramaInferior: true,
            },
          },
        },
      },
    },
  },
  ordensProducaoHistorico: { orderBy: { dataAlteracao: 'asc' } },
} as const;

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
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.ordemProducao,
      prismaClient: this.prisma,
      query,
      searchableFields: [
        'venda.cliente.nome',
        'venda.modeloCasa.nome',
        'status',
      ],
      numericSearchFields: ['id', 'venda_id'],
      tableName: 'ordens_producao',
      defaultOrderBy: { id: 'desc' },
      include: includeRelations,
      mapRow: (ordem: any) => ({
        id: ordem.id,
        status: ordem.status,
        dataAgendamento: ordem.dataAgendamento,
        vendaId: ordem.venda?.id || null,
        clienteNome: ordem.venda?.cliente?.nome || 'N/A',
        modeloNome:
          ordem.venda && ordem.venda.modeloId === null
            ? 'Venda de Placas'
            : ordem.venda?.modeloCasa?.nome || 'N/A',
        isVendaPlacas: ordem.venda ? ordem.venda.modeloId === null : false,
        venda: ordem.venda
          ? {
              ...ordem.venda,
              modeloCasa: {
                nome:
                  ordem.venda.modeloId === null
                    ? 'Venda de Placas'
                    : ordem.venda.modeloCasa?.nome || 'N/A',
              },
            }
          : null,
        ordensProducaoHistorico: ordem.ordensProducaoHistorico,
        hasPlacasAlocadas:
          ordem.venda?.vendaRequisitos?.some(
            (r: any) => r.placaAlocadaId !== null,
          ) || false,
      }),
      filterRequestedFields: false,
    });
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

    // Remover a imagem base64 para evitar payloads gigantes
    if (ordem.venda?.modeloCasa?.imagemBase64) {
      ordem.venda.modeloCasa.imagemBase64 = null;
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
            tipoPlacaId: r.tipoPlacaId,
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
        let itensParaConsumir: {
          materiaPrimaId: number;
          materiaPrima: any;
          quantidadeNecessaria: number;
        }[] = [];

        // Só desconta matérias-primas extras se for venda de Modelo.
        // Venda de placas avulsas não desconta material aqui pois já foi descontado no registro da placa.
        if (ordem.venda.modeloId) {
          if (
            ordem.venda.vendaItensOverride &&
            ordem.venda.vendaItensOverride.length > 0
          ) {
            itensParaConsumir = ordem.venda.vendaItensOverride.map((item) => ({
              materiaPrimaId: item.materiaPrimaId,
              materiaPrima: item.materiaPrima,
              quantidadeNecessaria: item.qtFinal,
            }));
          } else if (ordem.venda.modeloCasa) {
            itensParaConsumir = ordem.venda.modeloCasa.materiaisModeloCasa.map(
              (item) => ({
                materiaPrimaId: item.materiaPrimaId,
                materiaPrima: item.materiaPrima,
                quantidadeNecessaria: item.qtModelo,
              }),
            );
          }
        }

        // 1. Validar estoque de materiais
        for (const item of itensParaConsumir) {
          if (item.materiaPrima.quantidade < item.quantidadeNecessaria) {
            throw new ConflictException(
              `Estoque insuficiente para o material "${item.materiaPrima.item}".`,
            );
          }
        }

        // 2. Debitar estoque de materiais
        for (const item of itensParaConsumir) {
          await tx.materiaPrima.update({
            where: { id: item.materiaPrimaId },
            data: { quantidade: { decrement: item.quantidadeNecessaria } },
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
      let novoStatusVenda: StatusVenda | null = null;
      if (dto.status === StatusProducao.AGENDADO)
        novoStatusVenda = StatusVenda.PRODUCAO_AGENDADA;
      else if (dto.status === StatusProducao.MATERIAIS_PENDENTES)
        novoStatusVenda = StatusVenda.AGUARDANDO_AGENDAMENTO_PRODUCAO;
      else if (
        dto.status === StatusProducao.PREPARANDO_MATERIAIS ||
        dto.status === StatusProducao.EM_ESPERA
      )
        novoStatusVenda = StatusVenda.MATERIAIS_ALOCADOS;
      else if (dto.status === StatusProducao.MONTANDO_KIT)
        novoStatusVenda = StatusVenda.KIT_EM_PREPARACAO;
      else if (dto.status === StatusProducao.CANCELADO)
        novoStatusVenda = StatusVenda.CANCELADA;

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
        });
      }

      const ordemAtualizada = await tx.ordemProducao.update({
        where: { id },
        data: {
          status: StatusProducao.PRONTO_PARA_ENVIO,
          dataAgendamento: ordem.dataAgendamento || new Date(),
        },
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
      if (vendaAtual && vendaAtual.status !== StatusVenda.PRONTO_PARA_ENVIO) {
        await tx.venda.update({
          where: { id: ordem.vendaId },
          data: { status: StatusVenda.PRONTO_PARA_ENVIO },
        });
        await tx.vendaHistorico.create({
          data: {
            vendaId: ordem.vendaId,
            statusAnterior: vendaAtual.status,
            statusNovo: StatusVenda.PRONTO_PARA_ENVIO,
          },
        });
      }

      return ordemAtualizada;
    });
  }

  async findCompatiblePlates(requisitoId: number, availablePlacas?: any[]) {
    const req = await this.prisma.vendaRequisito.findUnique({
      where: { id: requisitoId },
      include: { corte: true },
    });
    if (!req) throw new NotFoundException('Requisito não encontrado');

    const placas =
      availablePlacas ||
      (await this.prisma.placa.findMany({
        where: {
          statusPlaca: StatusPlaca.DISPONIVEL,
          statusProducao: StatusProducaoPlaca.FINALIZADA,
          deletedAt: null,
          placasDerivadas: { none: {} },
        },
        include: { tipoPlaca: true },
      }));

    // Compatibilidade simplificada via tipoPlacaId
    // Para PLACA_LISA: basta o tipoPlaca ter mesmas dimensões, tramas e reforço que o requisito
    // Para CORTE_ESPECIFICO: exige mesmo formaCorteId
    const results = placas.filter((p: any) => {
      const tipo = p.tipoPlaca;
      if (!tipo) return false;

      // Se a placa não pertencer ao mesmo tipo de placa do requisito, já recusa.
      if (p.tipoPlacaId !== req.tipoPlacaId) return false;

      // Para cortes, a placa deve ter o mesmo corteId (formaCorteId)
      // Para PLACA_LISA (sem corte), a placa também não deve ter corte
      return (p.formaCorteId || null) === (req.corteId || null);
    });

    return results;
  }

  async findCompatiblePlatesBatch(reqIds: number[]) {
    if (!reqIds || reqIds.length === 0) return {};

    const placas = await this.prisma.placa.findMany({
      where: {
        statusPlaca: StatusPlaca.DISPONIVEL,
        statusProducao: StatusProducaoPlaca.FINALIZADA,
        deletedAt: null,
        placasDerivadas: { none: {} },
      },
      include: { tipoPlaca: true },
    });

    const results: Record<number, any[]> = {};
    for (const reqId of reqIds) {
      const comp = await this.findCompatiblePlates(reqId, placas).catch(
        () => [],
      );
      results[reqId] = comp.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        largura: p.tipoPlaca ? Number(p.tipoPlaca.largura) : 0,
        altura: p.tipoPlaca ? Number(p.tipoPlaca.altura) : 0,
      }));
    }
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
            placa.statusPlaca !== StatusPlaca.DISPONIVEL &&
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
              data: { statusPlaca: StatusPlaca.DISPONIVEL },
            });
          }

          // Aloca a nova
          await tx.placa.update({
            where: { id: item.placaId },
            data: { statusPlaca: StatusPlaca.ALOCADA },
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
              data: { statusPlaca: StatusPlaca.DISPONIVEL },
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
      if (placa.statusPlaca !== StatusPlaca.DISPONIVEL) {
        throw new ConflictException(
          'Esta placa não está disponível para alocação.',
        );
      }

      // Desaloca placa anterior se existir
      if (req.placaAlocadaId) {
        await tx.placa.update({
          where: { id: req.placaAlocadaId },
          data: { statusPlaca: StatusPlaca.DISPONIVEL },
        });
      }

      // Aloca nova placa
      await tx.vendaRequisito.update({
        where: { id: requisitoId },
        data: { placaAlocadaId: placaId },
      });

      await tx.placa.update({
        where: { id: placaId },
        data: { statusPlaca: StatusPlaca.ALOCADA },
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
        data: { statusPlaca: StatusPlaca.DISPONIVEL },
      });

      await tx.vendaRequisito.update({
        where: { id: requisitoId },
        data: { placaAlocadaId: null },
      });

      return { success: true };
    });
  }

  async remove(id: number) {
    const ordem = await this.findOne(id);
    if (ordem.status === StatusProducao.CANCELADO) {
      throw new ConflictException('Ordem já está cancelada.');
    }
    return this.prisma.ordemProducao.update({
      where: { id },
      data: { status: StatusProducao.CANCELADO },
    });
  }

  async desalocarTodasPlacas(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await this.findOne(id, tx);
      if (ordem.status !== StatusProducao.CANCELADO) {
        throw new ConflictException(
          'Só é possível desalocar as placas de uma ordem cancelada.',
        );
      }

      const requisitos = ordem.venda?.vendaRequisitos || [];
      const requisitosAlocados = requisitos.filter(
        (r) => r.placaAlocadaId !== null,
      );

      if (requisitosAlocados.length === 0) {
        throw new ConflictException('Nenhuma placa alocada para esta ordem.');
      }

      const placaIds = requisitosAlocados.map((r) => r.placaAlocadaId!);

      await tx.placa.updateMany({
        where: { id: { in: placaIds } },
        data: { statusPlaca: StatusPlaca.DISPONIVEL },
      });

      await tx.vendaRequisito.updateMany({
        where: { id: { in: requisitosAlocados.map((r) => r.id) } },
        data: { placaAlocadaId: null },
      });

      return {
        success: true,
        message: `${placaIds.length} placas desalocadas com sucesso.`,
      };
    });
  }
}
