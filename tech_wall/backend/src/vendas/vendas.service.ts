import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { formatDecimal } from '../common/utils/format.utils';
import {
  Prisma,
  StatusPagamentoVenda,
  StatusProducao,
  StatusVenda,
  TipoLancamento,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';

// Bloco de 'include' reutilizável para consistência
const includeRelations = {
  cliente: true,
  modeloCasa: true,
  user: { select: { id: true, fullName: true, username: true } },
  vendasHistorico: { orderBy: { dataAlteracao: 'asc' } },
  vendaRequisitos: {
    include: {
      tipoPlaca: {
        include: {
          tramaEsquerda: true,
          tramaDireita: true,
          tramaSuperior: true,
          tramaInferior: true,
        },
      },
      corte: true,
    },
  },
} as const;

@Injectable()
export class VendasService {
  constructor(private prisma: PrismaService) {}

  async findAll(excludeStatus?: StatusVenda) {
    const baseWhere: Prisma.VendaWhereInput = { isInternal: false };
    if (excludeStatus) {
      baseWhere.status = { not: excludeStatus };
    }

    return this.prisma.venda.findMany({
      where: baseWhere,
      orderBy: { id: 'desc' },
      include: includeRelations,
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
    excludeStatus?: StatusVenda,
  ): Promise<DataTableResult<any>> {
    const baseWhere: any = { isInternal: false };
    if (excludeStatus) {
      baseWhere.status = { not: excludeStatus };
    }

    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.venda,
      prismaClient: this.prisma,
      query,
      searchableFields: ['cliente.nome', 'modeloCasa.nome', 'enderecoEntrega'],
      numericSearchFields: ['id', 'preco'],
      tableName: 'vendas',
      baseWhere,
      totalCountWhere: baseWhere,
      select: {
        id: true,
        preco: true,
        status: true,
        statusPagamento: true,
        dataVenda: true,
        modeloId: true,
        cliente: { select: { nome: true } },
        modeloCasa: { select: { nome: true } },
        _count: {
          select: { vendaItensOverride: true },
        },
      },
      customSearchEnhancer: (searchValue: string) => {
        const conditions: any[] = [];
        const searchValueStr = searchValue.toUpperCase();
        const searchValueClean = searchValue.replace(/\s+/g, '_').toUpperCase();

        const matchedStatuses = Object.values(StatusVenda).filter(
          (val) =>
            String(val).toUpperCase().includes(searchValueStr) ||
            String(val).toUpperCase().includes(searchValueClean),
        ) as StatusVenda[];

        const matchedPagamentos = Object.values(StatusPagamentoVenda).filter(
          (val) =>
            String(val).toUpperCase().includes(searchValueStr) ||
            String(val).toUpperCase().includes(searchValueClean),
        ) as StatusPagamentoVenda[];

        if (searchValueStr.includes('PLACA')) {
          conditions.push({ modeloId: null });
        }

        if (matchedStatuses.length > 0) {
          conditions.push({ status: { in: matchedStatuses } });
        }

        if (matchedPagamentos.length > 0) {
          conditions.push({ statusPagamento: { in: matchedPagamentos } });
        }

        return conditions;
      },
      mapRow: (item: any) => ({
        id: item.id,
        preco: formatDecimal(item.preco),
        status: item.status,
        statusPagamento: item.statusPagamento,
        dataVenda: item.dataVenda,
        cliente: { nome: item.cliente?.nome || 'N/A' },
        modeloCasa: {
          nome:
            item.modeloId === null
              ? 'Venda de Placas'
              : item.modeloCasa?.nome || 'N/A',
        },
        isVendaPlacas: item.modeloId === null,
        possuiCustomizacao: (item._count?.vendaItensOverride ?? 0) > 0,
      }),
      filterRequestedFields: false,
    });
  }

  async create(dto: CreateVendaDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const isCustomized = dto.itensOverride && dto.itensOverride.length > 0;

      // Validação de existência do modelo base (opcional para vendas avulsas)
      let modelo = null;
      if (dto.modeloId) {
        modelo = await tx.modeloCasa.findUnique({
          where: { id: dto.modeloId, deletedAt: null },
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
        });
        if (!modelo) {
          throw new NotFoundException(
            `Modelo de casa com ID ${dto.modeloId} não encontrado.`,
          );
        }
      }

      // As vendas agora sempre iniciam com materiais pendentes para forçar o vínculo manual de placas na produção
      const statusProducaoInicial = StatusProducao.MATERIAIS_PENDENTES;

      const statusInicial: StatusVenda =
        StatusVenda.AGUARDANDO_AGENDAMENTO_PRODUCAO;

      const novaVenda = await tx.venda.create({
        data: {
          clienteId: dto.clienteId,
          modeloId: dto.modeloId,
          userId: userId,
          dataVenda: new Date(dto.dataVenda),
          preco: dto.preco,
          enderecoEntrega: dto.enderecoEntrega,
          status: statusInicial,
          statusPagamento: StatusPagamentoVenda.PENDENTE,
          suprimentosObra: (dto.suprimentosOverride ||
            modelo?.suprimentosObra ||
            []) as any,
        },
      });

      // Copiar receita (requisitos) do modelo para VendaRequisito (ou usar avulsas do dto)
      const finalRequisitos =
        dto.requisitosOverride || (modelo ? modelo.requisitos : []);
      if (finalRequisitos && finalRequisitos.length > 0) {
        await tx.vendaRequisito.createMany({
          data: finalRequisitos.map((r: any) => ({
            vendaId: novaVenda.id,
            tipo: r.tipo,
            alias: r.alias,
            parede: r.parede,
            tipoPlacaId: r.tipoPlacaId,
            corteId: r.corteId,
          })),
        });
      }

      // Copiar suprimentos de obra para VendaSuprimentoOverride
      const finalSuprimentos =
        dto.suprimentosOverride || (modelo?.suprimentosObra as any[]) || [];
      if (finalSuprimentos.length > 0) {
        await tx.vendaSuprimentoOverride.createMany({
          data: finalSuprimentos.map((s: any) => ({
            vendaId: novaVenda.id,
            nome: s.nome || s.name || '',
            quantidade: parseInt(String(s.quantidade ?? s.qty ?? 0), 10),
            unidade: s.unidade || s.unit || '',
            momento: s.momento || s.when || null,
          })),
        });
      }

      // Se for customizado, salva os itens na tabela de override
      if (isCustomized && dto.itensOverride) {
        await tx.vendaItemOverride.createMany({
          data: dto.itensOverride.map((item) => ({
            vendaId: novaVenda.id,
            materiaPrimaId: item.materiaPrimaId,
            qtFinal: item.qtFinal,
          })),
        });
      }

      // Registra o primeiro status no histórico
      await tx.vendaHistorico.create({
        data: {
          vendaId: novaVenda.id,
          statusAnterior: null,
          statusNovo: statusInicial,
        },
      });

      const novaOrdemProducao = await tx.ordemProducao.create({
        data: {
          vendaId: novaVenda.id,
          status: statusProducaoInicial,
        },
      });

      // Cria o primeiro registro no histórico de produção
      await tx.ordemProducaoHistorico.create({
        data: {
          ordemProducaoId: novaOrdemProducao.id,
          statusAnterior: null,
          statusNovo: statusProducaoInicial,
          notas: `Ordem de produção criada a partir da Venda #${novaVenda.id}.`,
        },
      });

      // Cria o lançamento financeiro
      await tx.lancamentoFinanceiro.create({
        data: {
          tipo: TipoLancamento.R,
          descricao: `Receita referente à Venda #${novaVenda.id}`,
          valorTotal: novaVenda.preco,
          valorPendente: novaVenda.preco,
          vendaId: novaVenda.id,
          statusPagamento: StatusPagamentoVenda.PENDENTE,
        },
      });

      // Atualiza os contadores de venda
      await tx.cliente.update({
        where: { id: dto.clienteId },
        data: { historicoVendas: { increment: 1 } },
      });
      await tx.user.update({
        where: { id: userId },
        data: { qtVendas: { increment: 1 } },
      });
      if (dto.modeloId) {
        await tx.modeloCasa.update({
          where: { id: dto.modeloId },
          data: { qtVendido: { increment: 1 } },
        });
      }

      return this.findOne(novaVenda.id, tx);
    });
  }
  async cancelar(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Valida a venda
      const venda = await tx.venda.findUnique({
        where: { id },
        include: { ordemProducao: true },
      });

      if (!venda) {
        throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
      }
      if (venda.status === StatusVenda.CANCELADA) {
        throw new ConflictException(`A Venda #${id} já está cancelada.`);
      }

      // 2. Cancela a Ordem de Produção associada
      const ordemProducao = await tx.ordemProducao.findFirst({
        where: { vendaId: id },
        include: {
          venda: {
            include: {
              modeloCasa: { include: { materiaisModeloCasa: true } },
            },
          },
        },
      });

      if (ordemProducao && ordemProducao.status !== StatusProducao.CANCELADO) {
        // Reverte o estoque se necessário
        if (
          ordemProducao.status === StatusProducao.PREPARANDO_MATERIAIS &&
          ordemProducao.venda &&
          ordemProducao.venda.modeloCasa
        ) {
          for (const item of ordemProducao.venda.modeloCasa
            .materiaisModeloCasa) {
            await tx.materiaPrima.update({
              where: { id: item.materiaPrimaId },
              data: { quantidade: { increment: item.qtModelo } },
            });
          }
        }
        // Atualiza o status da ordem
        await tx.ordemProducao.update({
          where: { id: ordemProducao.id },
          data: { status: StatusProducao.CANCELADO },
        });
        // Cria o histórico
        await tx.ordemProducaoHistorico.create({
          data: {
            ordemProducaoId: ordemProducao.id,
            statusAnterior: ordemProducao.status,
            statusNovo: StatusProducao.CANCELADO,
            notas: `Ordem cancelada devido ao cancelamento da Venda #${id}.`,
          },
        });
      }

      // 3. Cancela a Entrega associada
      const entrega = await tx.entrega.findFirst({ where: { vendaId: id } });
      if (entrega && entrega.status !== 'CANCELADA') {
        await tx.entrega.update({
          where: { id: entrega.id },
          data: { status: 'CANCELADA' },
        });
        await tx.entregaHistorico.create({
          data: {
            entregaId: entrega.id,
            statusAnterior: entrega.status,
            statusNovo: 'CANCELADA',
            notas: `Entrega cancelada devido ao cancelamento da Venda #${id}.`,
          },
        });
      }

      // 4. Atualiza os lançamentos financeiros da venda (somente receitas)
      const lancamentos = await tx.lancamentoFinanceiro.findMany({
        where: { vendaId: id, tipo: TipoLancamento.R },
      });

      for (const lanc of lancamentos) {
        // Se o valor pago for zero, não houve pagamento.
        const valorPago = lanc.valorTotal.minus(lanc.valorPendente);
        const novoStatus = valorPago.isZero()
          ? StatusPagamentoVenda.CANCELADO
          : StatusPagamentoVenda.ESTORNO_PENDENTE;

        await tx.lancamentoFinanceiro.update({
          where: { id: lanc.id },
          data: { statusPagamento: novoStatus },
        });
      }

      // 5. Decrementa contadores
      if (venda.clienteId) {
        await tx.cliente.update({
          where: { id: venda.clienteId },
          data: { historicoVendas: { decrement: 1 } },
        });
      }
      if (venda.userId) {
        await tx.user.update({
          where: { id: venda.userId },
          data: { qtVendas: { decrement: 1 } },
        });
      }
      if (venda.modeloId) {
        await tx.modeloCasa.update({
          where: { id: venda.modeloId },
          data: { qtVendido: { decrement: 1 } },
        });
      }

      // 6. Adiciona histórico e atualiza a venda
      await tx.vendaHistorico.create({
        data: {
          vendaId: id,
          statusAnterior: venda.status,
          statusNovo: StatusVenda.CANCELADA,
        },
      });

      return tx.venda.update({
        where: { id },
        data: {
          status: StatusVenda.CANCELADA,
          statusPagamento:
            venda.statusPagamento === StatusPagamentoVenda.PENDENTE
              ? StatusPagamentoVenda.CANCELADO
              : StatusPagamentoVenda.ESTORNO_PENDENTE,
        },
        include: includeRelations,
      });
    });
  }

  async findOne(id: number, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    const venda = await prisma.venda.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!venda)
      throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
    return venda;
  }

  async update(id: number, dto: UpdateVendaDto) {
    return this.prisma.$transaction(async (tx) => {
      const vendaOriginal = await tx.venda.findUnique({
        where: { id },
        include: {
          lancamentosFinanceiros: true,
          ordemProducao: true,
        },
      });

      if (!vendaOriginal) {
        throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
      }

      // 1. Valida se a produção já iniciou e bloqueia edição estrutural
      const producaoIniciada =
        vendaOriginal.ordemProducao &&
        vendaOriginal.ordemProducao.status !==
          StatusProducao.MATERIAIS_PENDENTES;

      if (producaoIniciada) {
        if (
          (dto.modeloId !== undefined &&
            dto.modeloId !== vendaOriginal.modeloId) ||
          dto.itensOverride ||
          dto.requisitosOverride
        ) {
          throw new ConflictException(
            'Não é possível alterar o modelo ou requisitos de uma venda após o início da produção (alocação de materiais).',
          );
        }
      }

      // 2. Atualiza campos básicos
      const modeloId =
        dto.modeloId !== undefined ? dto.modeloId : vendaOriginal.modeloId;
      await tx.venda.update({
        where: { id },
        data: {
          clienteId: dto.clienteId ?? vendaOriginal.clienteId,
          modeloId: modeloId,
          dataVenda: dto.dataVenda
            ? new Date(dto.dataVenda)
            : vendaOriginal.dataVenda,
          preco: dto.preco ?? vendaOriginal.preco,
          enderecoEntrega: dto.enderecoEntrega ?? vendaOriginal.enderecoEntrega,
        },
      });

      // 3. Atualiza contadores
      if (
        dto.clienteId !== undefined &&
        dto.clienteId !== vendaOriginal.clienteId
      ) {
        if (vendaOriginal.clienteId) {
          await tx.cliente.update({
            where: { id: vendaOriginal.clienteId },
            data: { historicoVendas: { decrement: 1 } },
          });
        }
        await tx.cliente.update({
          where: { id: dto.clienteId },
          data: { historicoVendas: { increment: 1 } },
        });
      }

      if (
        dto.modeloId !== undefined &&
        dto.modeloId !== vendaOriginal.modeloId
      ) {
        if (vendaOriginal.modeloId) {
          await tx.modeloCasa.update({
            where: { id: vendaOriginal.modeloId },
            data: { qtVendido: { decrement: 1 } },
          });
        }
        if (dto.modeloId) {
          await tx.modeloCasa.update({
            where: { id: dto.modeloId },
            data: { qtVendido: { increment: 1 } },
          });
        }
      }

      // 4. Relacionamentos aninhados (somente se não estiver bloqueado pela produção)
      if (!producaoIniciada) {
        if (dto.requisitosOverride) {
          await tx.vendaRequisito.deleteMany({ where: { vendaId: id } });
          if (dto.requisitosOverride.length > 0) {
            await tx.vendaRequisito.createMany({
              data: dto.requisitosOverride.map((r: any) => ({
                vendaId: id,
                tipo: r.tipo,
                alias: r.alias,
                parede: r.parede,
                tipoPlacaId: r.tipoPlacaId,
                corteId: r.corteId,
              })),
            });
          }
        }

        if (dto.itensOverride) {
          await tx.vendaItemOverride.deleteMany({ where: { vendaId: id } });
          if (dto.itensOverride.length > 0) {
            await tx.vendaItemOverride.createMany({
              data: dto.itensOverride.map((item: any) => ({
                vendaId: id,
                materiaPrimaId: item.materiaPrimaId,
                qtFinal: item.qtFinal,
              })),
            });
          }
        }
      }

      if (dto.suprimentosOverride) {
        await tx.vendaSuprimentoOverride.deleteMany({ where: { vendaId: id } });
        if (dto.suprimentosOverride.length > 0) {
          await tx.vendaSuprimentoOverride.createMany({
            data: dto.suprimentosOverride.map((s: any) => ({
              vendaId: id,
              nome: s.nome || s.name || '',
              quantidade: parseInt(String(s.quantidade ?? s.qty ?? 0), 10),
              unidade: s.unidade || s.unit || '',
              momento: s.momento || s.when || null,
            })),
          });
        }
      }

      // 5. Financeiro
      if (
        dto.preco !== undefined &&
        Number(dto.preco) !== Number(vendaOriginal.preco)
      ) {
        const lancamentoReceita = vendaOriginal.lancamentosFinanceiros.find(
          (l) =>
            l.tipo === TipoLancamento.R &&
            l.statusPagamento !== StatusPagamentoVenda.CANCELADO,
        );

        if (lancamentoReceita) {
          const diff = Number(dto.preco) - Number(vendaOriginal.preco);
          await tx.lancamentoFinanceiro.update({
            where: { id: lancamentoReceita.id },
            data: {
              valorTotal: dto.preco,
              valorPendente: { increment: diff },
            },
          });
        }
      }

      return this.findOne(id, tx);
    });
  }

  async findCustomization(id: number) {
    const items = await this.prisma.vendaItemOverride.findMany({
      where: { vendaId: id },
      include: {
        materiaPrima: true,
      },
    });

    return items.map((item) => {
      const { materiaPrima, ...rest } = item;
      return {
        ...rest,
        material: materiaPrima,
      };
    });
  }

  async registrarCompraSuprimento(
    vendaId: number,
    dto: { suprimentoId: string; precoPago: number },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({
        where: { id: vendaId },
        include: { modeloCasa: true },
      });
      if (!venda) throw new NotFoundException('Venda não encontrada');

      // Fallback: se a venda não tem a lista, inicializa com a do modelo
      let suprimentos = (venda.suprimentosObra as any[]) || [];
      if (suprimentos.length === 0 && venda.modeloCasa?.suprimentosObra) {
        suprimentos = (venda.modeloCasa.suprimentosObra as any[]) || [];
      }

      const itemIndex = suprimentos.findIndex(
        (s) => (s.id || s.nome) === dto.suprimentoId,
      );

      if (itemIndex === -1) {
        throw new NotFoundException('Suprimento não encontrado nesta venda');
      }

      // Atualiza o item no JSON
      suprimentos[itemIndex] = {
        ...suprimentos[itemIndex],
        status: 'ADQUIRIDO',
        precoPago: dto.precoPago,
        dataCompra: new Date(),
      };

      // Salva a venda com o JSON atualizado
      await tx.venda.update({
        where: { id: vendaId },
        data: { suprimentosObra: suprimentos },
      });

      // Cria o lançamento financeiro (SAÍDA)
      await tx.lancamentoFinanceiro.create({
        data: {
          tipo: TipoLancamento.D,
          descricao: `Compra de ${suprimentos[itemIndex].nome} - Venda #${vendaId}`,
          valorTotal: dto.precoPago,
          valorPendente: 0,
          vendaId: vendaId,
          statusPagamento: StatusPagamentoVenda.PAGO,
          dataUltimoPagamento: new Date(),
        },
      });

      return { message: 'Compra registrada com sucesso' };
    });
  }

  async getReportData(startDateStr?: string, endDateStr?: string) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
    }
    if (endDateStr) {
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter =
      startDate || endDate
        ? {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        : undefined;

    const where = {
      isInternal: false,
      ...(dateFilter ? { dataVenda: dateFilter } : {}),
    };

    return this.prisma.venda.findMany({
      where,
      orderBy: { dataVenda: 'desc' },
      select: {
        id: true,
        preco: true,
        status: true,
        statusPagamento: true,
        dataVenda: true,
        cliente: { select: { nome: true } },
        modeloCasa: { select: { nome: true } },
      },
    });
  }
}
