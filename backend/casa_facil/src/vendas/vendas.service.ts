import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, status_pagamento_venda, status_venda } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';

// Bloco de 'include' reutilizável para consistência
const includeRelations = {
  clientes: true,
  modelo_casa: true,
  users: { select: { id: true, full_name: true, username: true } },
};

@Injectable()
export class VendasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendaDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const modelo = await tx.modelo_casa.findUnique({
        where: { id: dto.modeloId },
        include: {
          materiais_modelo_casa: { include: { materiais_estoque: true } },
        },
      });
      if (!modelo)
        throw new NotFoundException(
          `Modelo de casa com ID ${dto.modeloId} não encontrado.`,
        );

      let statusInicial: status_venda =
        status_venda.Aguardando_Agendamento_de_Produ__o;
      const materiaisParaDebitar: { id: string; quantidade: number }[] = [];
      for (const item of modelo.materiais_modelo_casa) {
        if (item.materiais_estoque.qt_estoque < item.qt_modelo) {
          statusInicial = status_venda.Aguardando_Reposi__o_de_Estoque;
          materiaisParaDebitar.length = 0;
          break;
        }
        materiaisParaDebitar.push({
          id: item.materiais_estoque.id,
          quantidade: item.qt_modelo,
        });
      }

      const novaVenda = await tx.vendas.create({
        data: {
          cliente_id: dto.clienteId,
          modelo_id: dto.modeloId,
          user_id: userId,
          data_venda: new Date(dto.data_venda),
          preco: dto.preco,
          status: statusInicial,
          status_pagamento: status_pagamento_venda.Pendente,
        },
      });

      await tx.vendas_historico.create({
        data: {
          venda_id: novaVenda.id,
          status_anterior: null,
          status_novo: statusInicial,
        },
      });

      if (statusInicial !== status_venda.Aguardando_Reposi__o_de_Estoque) {
        for (const material of materiaisParaDebitar) {
          await tx.materiais_estoque.update({
            where: { id: material.id },
            data: { qt_estoque: { decrement: material.quantidade } },
          });
        }
      }

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

  findAll() {
    return this.prisma.vendas.findMany({
      orderBy: { data_venda: 'desc' },
      include: {
        ...includeRelations,
        vendas_historico: { orderBy: { data_alteracao: 'desc' } },
      },
    });
  }

  async findOne(id: number, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    const venda = await prisma.vendas.findUnique({
      where: { id },
      include: {
        ...includeRelations,
        vendas_historico: { orderBy: { data_alteracao: 'desc' } },
      },
    });
    if (!venda)
      throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
    return venda;
  }

  async update(id: number, dto: UpdateVendaDto) {
    await this.findOne(id); // Garante que a venda existe
    return this.prisma.vendas.update({
      where: { id },
      data: dto,
      include: {
        ...includeRelations,
        vendas_historico: { orderBy: { data_alteracao: 'desc' } },
      },
    });
  }
}
