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

    return this.prisma.materiais_estoque.create({
      data: dto,
    });
  }

  findAll() {
    // A extensão do Prisma já filtra os deletados
    return this.prisma.materiais_estoque.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    // A extensão do Prisma já filtra os deletados
    const material = await this.prisma.materiais_estoque.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material com ID "${id}" não encontrado.`);
    }
    return material;
  }

  async update(id: string, dto: UpdateMaterialDto) {
    await this.findOne(id); // Garante que o material existe
    return this.prisma.materiais_estoque.update({
      where: { id },
      data: {
        ...dto,
        // Exemplo de como usar a trigger de ultima_entrada/saida.
        // Se você não tiver a trigger, teria que fazer a lógica aqui.
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Garante que o material existe
    // A extensão do Prisma converte este 'delete' em um 'update' (soft delete)
    await this.prisma.materiais_estoque.delete({
      where: { id },
    });
    return { message: 'Material removido com sucesso.' };
  }
}
