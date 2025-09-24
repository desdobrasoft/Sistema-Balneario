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
    const { placa_especificacao, ...materialData } = dto;

    const materialExists = await this.prisma.materiais_estoque.findUnique({
      where: { id: dto.id },
    });

    if (materialExists) {
      throw new ConflictException('Um material com este ID já existe.');
    }

    return this.prisma.$transaction(async (tx) => {
      const material = await tx.materiais_estoque.create({
        data: materialData,
      });

      if (placa_especificacao) {
        await tx.placas_especificacoes.create({
          data: {
            material_id: material.id,
            ...placa_especificacao,
          },
        });
      }

      return this.findOne(material.id, tx);
    });
  }

  findAll() {
    return this.prisma.materiais_estoque.findMany({
      orderBy: { item: 'asc' },
      include: {
        tipos_materiais: true,
        placas_especificacoes: true,
      },
    });
  }

  async findOne(id: string, tx?: any) {
    const prisma = tx ?? this.prisma;
    const material = await prisma.materiais_estoque.findUnique({
      where: { id },
      include: {
        tipos_materiais: true,
        placas_especificacoes: true,
      },
    });

    if (!material) {
      throw new NotFoundException(`Material com ID "${id}" não encontrado.`);
    }
    return material;
  }

  async update(id: string, dto: UpdateMaterialDto) {
    const { placa_especificacao, ...materialData } = dto;
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updatedMaterial = await tx.materiais_estoque.update({
        where: { id },
        data: materialData,
      });

      if (placa_especificacao) {
        await tx.placas_especificacoes.upsert({
          where: { material_id: id },
          update: placa_especificacao,
          create: {
            material_id: id,
            ...placa_especificacao,
          },
        });
      }

      return this.findOne(id, tx);
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.materiais_estoque.delete({ where: { id } });
    return { message: 'Material removido com sucesso.' };
  }
}