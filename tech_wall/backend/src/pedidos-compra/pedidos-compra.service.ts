import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../types/express';
import { ComprarPedidoDto } from './dto/comprar-pedido.dto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ReceberPedidoDto } from './dto/receber-pedido.dto';

import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import {
  buildSearchFilter,
  getIdsByNumericPartialMatch,
} from '../common/utils/prisma-search.utils';

@Injectable()
export class PedidosCompraService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePedidoDto, user: AuthenticatedUser) {
    const isFinanceiro = dto.isDirectPurchase === true;

    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidoCompra.create({
        data: {
          materiaPrimaId: dto.materiaPrimaId,
          userId: user.id,
          qtSolicitada: dto.qtSolicitada,
          fornecedor: dto.fornecedor,
          // Financeiro cria direto como COMPRADO com valor; estoquista cria como SOLICITADO
          valorUnitario: isFinanceiro ? dto.valorUnitario : undefined,
          status: isFinanceiro ? 'COMPRADO' : 'SOLICITADO',
        },
        include: { materiaPrima: true },
      });

      if (isFinanceiro && dto.valorUnitario) {
        await tx.lancamentoFinanceiro.create({
          data: {
            tipo: 'D',
            descricao: `Compra de ${pedido.qtSolicitada} ${pedido.materiaPrima.unidade || ''} de ${pedido.materiaPrima.item}${pedido.fornecedor ? ' - ' + pedido.fornecedor : ''}`,
            valorTotal: dto.valorUnitario,
            valorPendente: 0,
            statusPagamento: 'PAGO',
            dataUltimoPagamento: new Date(),
          },
        });
      }

      return pedido;
    });
  }

  findAll() {
    return this.prisma.pedidoCompra.findMany({
      orderBy: { dataPedido: 'desc' },
      include: {
        materiaPrima: true,
        user: { select: { id: true, fullName: true } },
      },
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    const { start = 0, length = 10, search, draw = 1 } = query;
    const skip = start;
    const limit = length;
    const searchValue = search?.value || '';

    const baseWhere: any = {};
    let where = { ...baseWhere };

    if (searchValue) {
      const idsByValues = await getIdsByNumericPartialMatch(
        this.prisma,
        'pedidos_compra',
        ['qt_solicitada', 'qt_entregue', 'valor_unitario', 'id'],
        searchValue,
      );

      const searchFilter = buildSearchFilter(searchValue, [
        'fornecedor',
        'status',
        'materiaPrima.item',
        'user.fullName',
      ]);

      if (idsByValues.length > 0) {
        if (searchFilter.OR) {
          searchFilter.OR.push({
            id: { in: idsByValues.map((id) => Number(id)) },
          });
        } else {
          searchFilter.OR = [
            { id: { in: idsByValues.map((id) => Number(id)) } },
          ];
        }
      }

      where = { ...baseWhere, ...searchFilter };
    }

    const [data, total, filtered] = await Promise.all([
      this.prisma.pedidoCompra.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { dataPedido: 'desc' }],
        include: {
          materiaPrima: true,
          user: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.pedidoCompra.count({ where: baseWhere }),
      this.prisma.pedidoCompra.count({ where }),
    ]);

    return {
      draw,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async comprar(id: number, dto: ComprarPedidoDto) {
    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidoCompra.findUnique({
        where: { id },
        include: { materiaPrima: true },
      });
      if (!pedido)
        throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
      if (pedido.status !== 'SOLICITADO') {
        throw new ConflictException(
          'Apenas pedidos com status SOLICITADO podem ser marcados como comprados.',
        );
      }

      const updated = await tx.pedidoCompra.update({
        where: { id },
        data: {
          status: 'COMPRADO',
          fornecedor: dto.fornecedor || pedido.fornecedor,
          valorUnitario: dto.valorUnitario,
        },
        include: { materiaPrima: true },
      });

      const valorTotal = dto.valorUnitario || 0;

      await tx.lancamentoFinanceiro.create({
        data: {
          tipo: 'D', // Despesa
          descricao: `Compra de ${pedido.qtSolicitada} ${updated.materiaPrima.unidade || ''} de ${updated.materiaPrima.item}${updated.fornecedor ? ' - ' + updated.fornecedor : ''}`,
          valorTotal,
          valorPendente: 0,
          statusPagamento: 'PAGO',
          dataUltimoPagamento: new Date(),
        },
      });

      return updated;
    });
  }

  // Estoquista recebe pedido (deve estar COMPRADO)
  async receber(id: number, dto: ReceberPedidoDto) {
    if (String(dto.status) === 'ENTREGUE_COM_ALTERACAO' && !dto.qtEntregue) {
      throw new BadRequestException(
        'A quantidade entregue é obrigatória para entregas com alteração.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidoCompra.findUnique({ where: { id } });
      if (!pedido)
        throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
      if (pedido.status !== 'COMPRADO') {
        throw new ConflictException(
          'Este pedido precisa estar com status COMPRADO para ser recebido.',
        );
      }

      const quantidadeRecebida =
        String(dto.status) === 'ENTREGUE'
          ? pedido.qtSolicitada
          : dto.qtEntregue;

      // Atualiza o estoque do material
      await tx.materiaPrima.update({
        where: { id: pedido.materiaPrimaId },
        data: { quantidade: { increment: quantidadeRecebida } },
      });

      // Atualiza o pedido
      return tx.pedidoCompra.update({
        where: { id },
        data: {
          status: dto.status,
          qtEntregue: quantidadeRecebida,
        },
      });
    });
  }

  // Financeiro resolve pedido com alteração
  async resolver(id: number) {
    const pedido = await this.prisma.pedidoCompra.findUnique({
      where: { id },
    });
    if (!pedido)
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    if (pedido.status !== 'ENTREGUE_COM_ALTERACAO') {
      throw new ConflictException(
        'Apenas pedidos com entrega alterada podem ser resolvidos.',
      );
    }

    return this.prisma.pedidoCompra.update({
      where: { id },
      data: { status: 'RESOLVIDO' },
    });
  }
}
