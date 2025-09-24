import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, status_entrega } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { UpdateEntregaDto } from './dto/update-entrega.dto';

// Bloco de 'include' reutilizável
const includeRelations = {
  entregas_historico: {
    orderBy: {
      data_alteracao: 'asc',
    },
  },
  vendas: {
    include: {
      clientes: true,
      modelo_casa: true,
      users: { select: { id: true, full_name: true } },
    },
  },
} as const;

@Injectable()
export class EntregasService {
  constructor(private prisma: PrismaService) {}

  // O método 'create' já está bom
  create(dto: CreateEntregaDto) {
    return this.prisma.entregas.create({
      data: {
        venda_id: dto.venda_id,
        endereco_entrega: dto.endereco_entrega,
        previsao_entrega: new Date(dto.previsao_entrega),
        status: status_entrega.PENDENTE_TRANSPORTADORA,
      },
    });
  }

  findAll() {
    return this.prisma.entregas.findMany({
      orderBy: { previsao_entrega: 'asc' },
      include: includeRelations,
    });
  }

  async findOne(id: number) {
    const entrega = await this.prisma.entregas.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!entrega)
      throw new NotFoundException(`Entrega com ID ${id} não encontrada.`);
    return entrega;
  }

  async update(id: number, dto: UpdateEntregaDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Busca o estado atual da entrega
      const entregaAtual = await tx.entregas.findUnique({
        where: { id },
      });
      if (!entregaAtual) {
        throw new NotFoundException(`Entrega com ID ${id} não encontrada.`);
      }

      // 2. Se o status foi alterado, cria um registro de histórico
      if (dto.status && dto.status !== entregaAtual.status) {
        await tx.entregas_historico.create({
          data: {
            entrega_id: id,
            status_anterior: entregaAtual.status,
            status_novo: dto.status,
            notas: dto.notas, // Salva a nota da alteração
          },
        });
      }

      // 3. Atualiza a entrega com os novos dados
      return tx.entregas.update({
        where: { id },
        data: {
          status: dto.status,
          transportadora: dto.transportadora,
          previsao_entrega: dto.previsao_entrega
            ? new Date(dto.previsao_entrega)
            : undefined,
        },
        include: includeRelations, // Retorna o objeto atualizado com o histórico
      });
    });
  }
}
