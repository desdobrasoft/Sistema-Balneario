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
      // Validação de existência do modelo ainda é necessária
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
      if (!modelo)
        throw new NotFoundException(
          `Modelo de casa com ID ${dto.modeloId} não encontrado.`,
        );

      const statusInicial: status_venda =
        status_venda.AGUARDANDO_AGENDAMENTO_PRODUCAO;

      let statusProducaoInicial: status_producao = status_producao.AGENDADO;
      for (const item of modelo.materiais_modelo_casa) {
        if (item.materiais_estoque.qt_estoque < item.qt_modelo) {
          statusProducaoInicial = status_producao.MATERIAIS_PENDENTES;
          break;
        }
      }

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
      const venda = await tx.vendas.findUnique({ where: { id } });

      if (!venda)
        throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
      if (venda.status === status_venda.CANCELADA) {
        throw new ConflictException(`A Venda #${id} já está cancelada.`);
      }

      // Decrementa os contadores
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

      // Cria o lançamento financeiro de estorno
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

      // Marca a venda e seu lançamento original como Cancelados
      await tx.lancamentos_financeiros.updateMany({
        where: { venda_id: id, tipo: tipo_lancamento.R },
        data: { status_pagamento: status_pagamento_venda.CANCELADO },
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

  findAll() {
    return this.prisma.vendas.findMany({
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
}
