import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  create(createClienteDto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: createClienteDto });
  }

  findAll() {
    return this.prisma.cliente.findMany({
      orderBy: { id: 'desc' },
      where: { isInternal: false },
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    const { skip, take, where, orderBy } =
      PrismaDatatableHelper.buildPrismaQuery(
        query,
        ['nome', 'email', 'nroContato'],
        { isInternal: false },
      );

    const [data, total, filtered] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take,
        orderBy: Object.keys(orderBy).length ? orderBy : { id: 'desc' },
      }),
      this.prisma.cliente.count({ where: { isInternal: false } }),
      this.prisma.cliente.count({ where }),
    ]);

    const requestedFields = (query.columns
      ?.map((c) => c.data)
      .filter((d) => d && d !== 'null') || []) as string[];

    const finalData = data.map((cliente: any) => {
      const flatObj: any = {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        nroContato: cliente.nroContato,
        isInternal: cliente.isInternal,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt,
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

  async findOrCreateInternalClient() {
    const internalClient = await this.prisma.cliente.findFirst({
      where: { isInternal: true, nome: 'Cliente Interno' },
    });

    if (internalClient) {
      return internalClient;
    }

    return this.prisma.cliente.create({
      data: {
        nome: 'Cliente Interno',
        isInternal: true,
      },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    // Garante que o cliente existe antes de tentar atualizar
    await this.findOne(id);
    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.cliente.delete({ where: { id } });
    return { message: 'Cliente removido com sucesso' };
  }
}
