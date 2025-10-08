import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  create(createClienteDto: CreateClienteDto) {
    return this.prisma.clientes.create({ data: createClienteDto });
  }

  findAll() {
    return this.prisma.clientes.findMany({
      where: { is_internal: false },
      orderBy: { nome: 'asc' },
    });
  }

  async findOrCreateInternalClient() {
    const internalClient = await this.prisma.clientes.findFirst({
      where: { is_internal: true, nome: 'Cliente Interno' },
    });

    if (internalClient) {
      return internalClient;
    }

    return this.prisma.clientes.create({
      data: {
        nome: 'Cliente Interno',
        is_internal: true,
      },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.clientes.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    // Garante que o cliente existe antes de tentar atualizar
    await this.findOne(id);
    return this.prisma.clientes.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.clientes.delete({ where: { id } });
    return { message: 'Cliente removido com sucesso' };
  }
}
