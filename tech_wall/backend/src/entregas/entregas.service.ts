import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusEntrega } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntregaDto } from './dto/create-entrega.dto';

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
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';

@Injectable()
export class EntregasService {
  constructor(private prisma: PrismaService) {}

  // O método 'create' já está bom
  create(dto: CreateEntregaDto) {
    return this.prisma.entrega.create({
      data: {
        vendaId: dto.vendaId,
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
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.entrega,
      prismaClient: this.prisma,
      query,
      searchableFields: [
        'venda.cliente.nome',
        'venda.enderecoEntrega',
        'transportadora',
        'status',
      ],
      numericSearchFields: ['id', 'venda_id'],
      tableName: 'entregas',
      defaultOrderBy: { previsaoEntrega: 'asc' },
      include: includeRelations,
      filterRequestedFields: false,
    });
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

  async agendarColeta(
    id: number,
    transportadora: string,
    previsaoEntrega: string,
    notas?: string,
  ) {
    return this.changeStatus(id, StatusEntrega.COLETA_AGENDADA, notas, {
      transportadora,
      previsaoEntrega: new Date(previsaoEntrega),
    });
  }

  async editarAgendamento(
    id: number,
    transportadora: string,
    previsaoEntrega: string,
    notas?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const entrega = await tx.entrega.findUnique({ where: { id } });
      if (!entrega)
        throw new NotFoundException(`Entrega com ID ${id} não encontrada.`);

      if (notas) {
        await tx.entregaHistorico.create({
          data: { entregaId: id, statusNovo: entrega.status, notas },
        });
      }

      return tx.entrega.update({
        where: { id },
        data: { transportadora, previsaoEntrega: new Date(previsaoEntrega) },
        include: includeRelations,
      });
    });
  }

  async iniciarEntrega(id: number, notas?: string) {
    return this.changeStatus(id, StatusEntrega.EM_TRANSITO, notas);
  }

  async finalizarEntrega(id: number, notas?: string) {
    return this.changeStatus(id, StatusEntrega.ENTREGUE, notas);
  }

  async cancelarEntrega(id: number, notas?: string) {
    return this.changeStatus(id, StatusEntrega.CANCELADA, notas);
  }

  private async changeStatus(
    id: number,
    novoStatus: StatusEntrega,
    notas?: string,
    extraData?: any,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const entregaAtual = await tx.entrega.findUnique({ where: { id } });
      if (!entregaAtual) {
        throw new NotFoundException(`Entrega com ID ${id} não encontrada.`);
      }

      if (novoStatus !== entregaAtual.status) {
        await tx.entregaHistorico.create({
          data: {
            entregaId: id,
            statusAnterior: entregaAtual.status,
            statusNovo: novoStatus,
            notas,
          },
        });
      }

      const entregaAtualizada = await tx.entrega.update({
        where: { id },
        data: {
          status: novoStatus,
          ...extraData,
        },
        include: includeRelations,
      });

      // Mapeamento e atualização do status da Venda (sincronização)
      let novoStatusVenda:
        import('../generated/prisma/client').StatusVenda | null = null;
      if (
        novoStatus === StatusEntrega.PENDENTE_TRANSPORTADORA ||
        novoStatus === StatusEntrega.COLETA_AGENDADA
      )
        novoStatusVenda = 'PRONTO_PARA_ENVIO';
      else if (novoStatus === StatusEntrega.EM_TRANSITO)
        novoStatusVenda = 'ENVIADO';
      else if (novoStatus === StatusEntrega.ENTREGUE)
        novoStatusVenda = 'ENTREGUE';
      else if (novoStatus === StatusEntrega.CANCELADA)
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

      return entregaAtualizada;
    });
  }
}
