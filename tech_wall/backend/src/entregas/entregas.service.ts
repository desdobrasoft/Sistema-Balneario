import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusEntrega } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { UpdateEntregaDto } from './dto/update-entrega.dto';

// Bloco de 'include' reutilizável
const includeRelations = {
  entregasHistorico: {
    orderBy: {
      dataAlteracao: 'asc',
    },
  },
  venda: {
    include: {
      cliente: true,
      modeloCasa: true,
      user: { select: { id: true, fullName: true } },
    },
  },
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
export class EntregasService {
  constructor(private prisma: PrismaService) {}

  // O método 'create' já está bom
  create(dto: CreateEntregaDto) {
    return this.prisma.entrega.create({
      data: {
        vendaId: dto.vendaId,
        enderecoEntrega: dto.enderecoEntrega,
        previsaoEntrega: new Date(dto.previsaoEntrega),
        status: StatusEntrega.PENDENTE_TRANSPORTADORA,
      },
    });
  }

  findAll() {
    return this.prisma.entrega.findMany({
      orderBy: { previsaoEntrega: 'asc' },
      include: includeRelations,
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
      const idsByOrder = await getIdsByNumericPartialMatch(
        this.prisma,
        'entregas',
        ['id', 'venda_id'],
        searchValue,
      );

      const searchFilter = buildSearchFilter(searchValue, [
        'venda.cliente.nome',
        'enderecoEntrega',
        'transportadora',
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
      this.prisma.entrega.findMany({
        where,
        skip,
        take: limit,
        orderBy: { previsaoEntrega: 'asc' },
        include: includeRelations,
      }),
      this.prisma.entrega.count({ where: baseWhere }),
      this.prisma.entrega.count({ where }),
    ]);

    return {
      draw,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async findOne(id: number) {
    const entrega = await this.prisma.entrega.findUnique({
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
      const entregaAtual = await tx.entrega.findUnique({
        where: { id },
      });
      if (!entregaAtual) {
        throw new NotFoundException(`Entrega com ID ${id} não encontrada.`);
      }

      // 2. Se o status foi alterado, cria um registro de histórico
      if (dto.status && dto.status !== entregaAtual.status) {
        await tx.entregaHistorico.create({
          data: {
            entregaId: id,
            statusAnterior: entregaAtual.status,
            statusNovo: dto.status,
            notas: dto.notas, // Salva a nota da alteração
          },
        });
      }

      // 3. Atualiza a entrega com os novos dados
      const entregaAtualizada = await tx.entrega.update({
        where: { id },
        data: {
          status: dto.status,
          transportadora: dto.transportadora,
          previsaoEntrega: dto.previsaoEntrega
            ? new Date(dto.previsaoEntrega)
            : undefined,
        },
        include: includeRelations, // Retorna o objeto atualizado com o histórico
      });

      // Mapeamento e atualização do status da Venda (sincronização)
      if (dto.status && dto.status !== entregaAtual.status) {
        let novoStatusVenda:
          | import('../generated/prisma/client').StatusVenda
          | null = null;
        if (
          dto.status === StatusEntrega.PENDENTE_TRANSPORTADORA ||
          dto.status === StatusEntrega.COLETA_AGENDADA
        )
          novoStatusVenda = 'PRONTO_PARA_ENVIO';
        else if (dto.status === StatusEntrega.EM_TRANSITO)
          novoStatusVenda = 'ENVIADO';
        else if (dto.status === StatusEntrega.ENTREGUE)
          novoStatusVenda = 'ENTREGUE';
        else if (dto.status === StatusEntrega.CANCELADA)
          novoStatusVenda = 'CANCELADA';

        if (novoStatusVenda && entregaAtual.vendaId) {
          const vendaAtual = await tx.venda.findUnique({
            where: { id: entregaAtual.vendaId },
          });
          if (vendaAtual && vendaAtual.status !== novoStatusVenda) {
            await tx.venda.update({
              where: { id: entregaAtual.vendaId },
              data: { status: novoStatusVenda },
            });
            await tx.vendaHistorico.create({
              data: {
                vendaId: entregaAtual.vendaId,
                statusAnterior: vendaAtual.status,
                statusNovo: novoStatusVenda,
              },
            });
          }
        }
      }

      return entregaAtualizada;
    });
  }
}
