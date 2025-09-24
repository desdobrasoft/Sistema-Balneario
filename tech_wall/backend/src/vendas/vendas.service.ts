import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  status_pagamento_venda,
  status_producao,
  status_venda,
  tipo_lancamento,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';

// Bloco de 'include' reutilizável para consistência
const includeRelations = {
  clientes: true,
  modelo_casa: true,
  users: { select: { id: true, full_name: true, username: true } },
  vendas_historico: { orderBy: { data_alteracao: 'asc' } },
} as const;

@Injectable()
export class VendasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendaDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const isCustomized = dto.itensOverride && dto.itensOverride.length > 0;

      // Validação de existência do modelo base
      const modelo = await tx.modelo_casa.findUnique({
        where: { id: dto.modeloId, deleted_at: null },
        include: {
          materiais_modelo_casa: {
            include: {
              materiais_estoque: true,
            },
          },
        },
      });
      if (!modelo) {
        throw new NotFoundException(
          `Modelo de casa com ID ${dto.modeloId} não encontrado.`,
        );
      }

      // Lógica de verificação de estoque
      let statusProducaoInicial: status_producao = status_producao.AGENDADO;
      if (isCustomized && dto.itensOverride) {
        for (const item of dto.itensOverride) {
          const materialEstoque = await tx.materiais_estoque.findUnique({
            where: { id: item.materialId },
          });
          if (!materialEstoque || materialEstoque.quantidade < item.qtFinal) {
            statusProducaoInicial = status_producao.MATERIAIS_PENDENTES;
            break;
          }
        }
      } else {
        for (const item of modelo.materiais_modelo_casa) {
          if (item.materiais_estoque.quantidade < item.qt_modelo) {
            statusProducaoInicial = status_producao.MATERIAIS_PENDENTES;
            break;
          }
        }
      }

      const statusInicial: status_venda =
        status_venda.AGUARDANDO_AGENDAMENTO_PRODUCAO;

      const novaVenda = await tx.vendas.create({
        data: {
          cliente_id: dto.clienteId,
          modelo_id: dto.modeloId,
          user_id: userId,
          data_venda: new Date(dto.data_venda),
          preco: dto.preco,
          endereco_entrega: dto.endereco_entrega,
          status: statusInicial,
          status_pagamento: status_pagamento_venda.PENDENTE,
        },
      });

      // Se for customizado, salva os itens na tabela de override
      if (isCustomized && dto.itensOverride) {
        await tx.venda_itens_override.createMany({
          data: dto.itensOverride.map((item) => ({
            venda_id: novaVenda.id,
            material_id: item.materialId,
            qt_final: item.qtFinal,
          })),
        });
      }

      // Registra o primeiro status no histórico
      await tx.vendas_historico.create({
        data: {
          venda_id: novaVenda.id,
          status_anterior: null,
          status_novo: statusInicial,
        },
      });

      const novaOrdemProducao = await tx.ordens_producao.create({
        data: {
          venda_id: novaVenda.id,
          status: statusProducaoInicial,
        },
      });

      // Cria o primeiro registro no histórico de produção
      await tx.ordens_producao_historico.create({
        data: {
          ordem_producao_id: novaOrdemProducao.id,
          status_anterior: null,
          status_novo: statusProducaoInicial,
          notas: `Ordem de produção criada a partir da Venda #${novaVenda.id}.`,
        },
      });

      // Cria o lançamento financeiro
      await tx.lancamentos_financeiros.create({
        data: {
          tipo: tipo_lancamento.R,
          descricao: `Receita referente à Venda #${novaVenda.id}`,
          valor_total: novaVenda.preco,
          valor_pendente: novaVenda.preco,
          venda_id: novaVenda.id,
          status_pagamento: status_pagamento_venda.PENDENTE,
        },
      });

      // Atualiza os contadores de venda
      await tx.clientes.update({
        where: { id: dto.clienteId },
        data: { historico_vendas: { increment: 1 } },
      });
      await tx.users.update({
        where: { id: userId },
        data: { qt_vendas: { increment: 1 } },
      });
      await tx.modelo_casa.update({
        where: { id: dto.modeloId },
        data: { qt_vendido: { increment: 1 } },
      });

      return this.findOne(novaVenda.id, tx);
    });
  }

  async estornar(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Valida a venda
      const venda = await tx.vendas.findUnique({
        where: { id },
        include: { ordens_producao: true },
      });

      if (!venda) {
        throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
      }
      if (venda.status === status_venda.CANCELADA) {
        throw new ConflictException(`A Venda #${id} já está cancelada.`);
      }

      // 2. Cancela a Ordem de Produção associada
      const ordemProducao = await tx.ordens_producao.findFirst({
        where: { venda_id: id },
        include: {
          vendas: {
            include: {
              modelo_casa: { include: { materiais_modelo_casa: true } },
            },
          },
        },
      });

      if (ordemProducao && ordemProducao.status !== status_producao.CANCELADO) {
        // Reverte o estoque se necessário
        if (
          ordemProducao.status === status_producao.PREPARANDO_MATERIAIS &&
          ordemProducao.vendas &&
          ordemProducao.vendas.modelo_casa
        ) {
          for (const item of ordemProducao.vendas.modelo_casa
            .materiais_modelo_casa) {
            await tx.materiais_estoque.update({
              where: { id: item.material_id },
              data: { quantidade: { increment: item.qt_modelo } },
            });
          }
        }
        // Atualiza o status da ordem
        await tx.ordens_producao.update({
          where: { id: ordemProducao.id },
          data: { status: status_producao.CANCELADO },
        });
        // Cria o histórico
        await tx.ordens_producao_historico.create({
          data: {
            ordem_producao_id: ordemProducao.id,
            status_anterior: ordemProducao.status,
            status_novo: status_producao.CANCELADO,
            notas: `Ordem cancelada devido ao estorno da Venda #${id}.`,
          },
        });
      }

      // 3. Cancela a Entrega associada
      const entrega = await tx.entregas.findFirst({ where: { venda_id: id } });
      if (entrega && entrega.status !== 'CANCELADA') {
        await tx.entregas.update({
          where: { id: entrega.id },
          data: { status: 'CANCELADA' },
        });
        await tx.entregas_historico.create({
          data: {
            entrega_id: entrega.id,
            status_anterior: entrega.status,
            status_novo: 'CANCELADA',
            notas: `Entrega cancelada devido ao estorno da Venda #${id}.`,
          },
        });
      }

      // 4. Estorna os lançamentos financeiros
      await tx.lancamentos_financeiros.updateMany({
        where: { venda_id: id, tipo: tipo_lancamento.R },
        data: { status_pagamento: status_pagamento_venda.CANCELADO },
      });
      await tx.lancamentos_financeiros.create({
        data: {
          tipo: tipo_lancamento.D,
          descricao: `Estorno referente à Venda #${venda.id}`,
          valor_total: venda.preco,
          valor_pendente: 0,
          venda_id: venda.id,
          status_pagamento: status_pagamento_venda.CANCELADO,
        },
      });

      // 5. Decrementa contadores
      if (venda.cliente_id) {
        await tx.clientes.update({
          where: { id: venda.cliente_id },
          data: { historico_vendas: { decrement: 1 } },
        });
      }
      if (venda.user_id) {
        await tx.users.update({
          where: { id: venda.user_id },
          data: { qt_vendas: { decrement: 1 } },
        });
      }
      if (venda.modelo_id) {
        await tx.modelo_casa.update({
          where: { id: venda.modelo_id },
          data: { qt_vendido: { decrement: 1 } },
        });
      }

      // 6. Adiciona histórico e atualiza a venda
      await tx.vendas_historico.create({
        data: {
          venda_id: id,
          status_anterior: venda.status,
          status_novo: status_venda.CANCELADA,
        },
      });

      return tx.vendas.update({
        where: { id },
        data: {
          status: status_venda.CANCELADA,
          status_pagamento: status_pagamento_venda.CANCELADO,
        },
        include: includeRelations,
      });
    });
  }

  findAll(excludeStatus?: status_venda) {
    const where: Prisma.vendasWhereInput = {};

    if (excludeStatus) {
      where.status = {
        not: excludeStatus,
      };
    }

    return this.prisma.vendas.findMany({
      where,
      orderBy: { id: 'asc' },
      include: includeRelations,
    });
  }

  async findOne(id: number, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    const venda = await prisma.vendas.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!venda)
      throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
    return venda;
  }

  async update(id: number, dto: UpdateVendaDto) {
    await this.findOne(id);
    return this.prisma.vendas.update({
      where: { id },
      data: dto,
      include: includeRelations,
    });
  }

  async findCustomization(id: number) {
    const items = await this.prisma.venda_itens_override.findMany({
      where: { venda_id: id },
      include: {
        materiais_estoque: true,
      },
    });

    return items.map((item) => {
      const { materiais_estoque, ...rest } = item;
      return {
        ...rest,
        material: materiais_estoque,
      };
    });
  }
}
