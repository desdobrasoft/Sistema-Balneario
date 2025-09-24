import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModeloCasaDto } from './dto/create-modelo-casa.dto';
import { UpdateModeloCasaDto } from './dto/update-modelo-casa.dto';

@Injectable()
export class ModeloCasaService {
  constructor(private prisma: PrismaService) {}

  // SEU MÉTODO CREATE (sem alterações)
  async create(createModeloCasaDto: CreateModeloCasaDto) {
    const { materiais, ...modeloData } = createModeloCasaDto;
    return this.prisma.$transaction(async (tx) => {
      const novoModelo = await tx.modelo_casa.create({ data: modeloData });
      const materiaisParaCriar = materiais.map((m) => ({
        modelo_casa_id: novoModelo.id,
        material_id: m.materialId,
        qt_modelo: m.qt_modelo,
      }));
      await tx.materiais_modelo_casa.createMany({ data: materiaisParaCriar });
      return this.findOne(novoModelo.id, tx); // Reutiliza o findOne para consistência
    });
  }

  // MÉTODO FINDALL (NOVO)
  findAll() {
    return this.prisma.modelo_casa.findMany({
      where: { deleted_at: null }, // Filtra os soft-deleted
      orderBy: { nome: 'asc' },
      include: {
        materiais_modelo_casa: {
          orderBy: { materiais_estoque: { item: 'asc' } },
          include: { materiais_estoque: true },
        },
      },
    });
  }

  // MÉTODO FINDONE (NOVO)
  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const modelo = await prisma.modelo_casa.findUnique({
      where: { id, deleted_at: null },
      include: {
        materiais_modelo_casa: {
          include: { materiais_estoque: true },
        },
      },
    });
    if (!modelo) {
      throw new NotFoundException(
        `Modelo de casa com ID ${id} não encontrado.`,
      );
    }
    return modelo;
  }

  // MÉTODO UPDATE (NOVO)
  async update(id: number, updateModeloCasaDto: UpdateModeloCasaDto) {
    const { materiais, ...modeloData } = updateModeloCasaDto;
    return this.prisma.$transaction(async (tx) => {
      // 1. Garante que o modelo existe
      await this.findOne(id, tx);

      // 2. Atualiza os dados principais do modelo
      await tx.modelo_casa.update({
        where: { id },
        data: modeloData,
      });

      // 3. Se uma nova lista de materiais foi enviada, substitui a antiga
      if (materiais) {
        // Deleta as associações antigas
        await tx.materiais_modelo_casa.deleteMany({
          where: { modelo_casa_id: id },
        });
        // Cria as novas associações
        const materiaisParaCriar = materiais.map((m) => ({
          modelo_casa_id: id,
          material_id: m.materialId,
          qt_modelo: m.qt_modelo,
        }));
        await tx.materiais_modelo_casa.createMany({ data: materiaisParaCriar });
      }

      // 4. Retorna o objeto completo e atualizado
      return this.findOne(id, tx);
    });
  }

  // MÉTODO REMOVE (NOVO - SOFT DELETE)
  async remove(id: number) {
    // Garante que o modelo existe antes de tentar deletar
    await this.findOne(id);
    // O middleware/extensão do Prisma fará a mágica do soft delete
    await this.prisma.modelo_casa.delete({ where: { id } });
    return { message: 'Modelo de casa removido com sucesso.' };
  }
}
