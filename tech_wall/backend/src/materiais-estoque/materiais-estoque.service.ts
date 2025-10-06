import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MateriaisEstoqueService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMaterialDto) {
    const materialExists = await this.prisma.materiais_estoque.findUnique({
      where: { id: dto.id },
    });

    if (materialExists) {
      throw new ConflictException('Um material com este ID já existe.');
    }

    const material = await this.prisma.materiais_estoque.create({
      data: dto,
    });

    return this.findOne(material.id);
  }

  findAll() {
    return this.prisma.materiais_estoque.findMany({
      orderBy: { item: 'asc' },
      include: {
        tipos_materiais: true,
      },
    });
  }

  async findOne(id: string, tx?: any) {
    const prisma = tx ?? this.prisma;
    const material = await prisma.materiais_estoque.findUnique({
      where: { id },
      include: {
        tipos_materiais: true,
      },
    });

    if (!material) {
      throw new NotFoundException(`Material com ID "${id}" não encontrado.`);
    }
    return material;
  }

  async update(id: string, dto: UpdateMaterialDto) {
    await this.findOne(id);

    await this.prisma.materiais_estoque.update({
      where: { id },
      data: dto,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.materiais_estoque.delete({ where: { id } });
    return { message: 'Material removido com sucesso.' };
  }
}