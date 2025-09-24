import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';

@Injectable()
export class TiposMateriaisService {
  constructor(private prisma: PrismaService) {}

  create(createTipoMaterialDto: CreateTipoMaterialDto) {
    return this.prisma.tipos_materiais.create({
      data: createTipoMaterialDto,
    });
  }

  findAll() {
    return this.prisma.tipos_materiais.findMany();
  }

  async findOne(id: number) {
    const tipo = await this.prisma.tipos_materiais.findUnique({
      where: { id },
    });
    if (!tipo) {
      throw new NotFoundException(`Tipo de material com ID ${id} não encontrado.`);
    }
    return tipo;
  }

  async update(id: number, updateTipoMaterialDto: UpdateTipoMaterialDto) {
    await this.findOne(id);
    return this.prisma.tipos_materiais.update({
      where: { id },
      data: updateTipoMaterialDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tipos_materiais.delete({
      where: { id },
    });
  }
}
