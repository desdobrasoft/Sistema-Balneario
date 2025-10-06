import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModeloCasaDto } from './dto/create-modelo-casa.dto';
import { UpdateModeloCasaDto } from './dto/update-modelo-casa.dto';

@Injectable()
export class ModeloCasaService {
  constructor(private prisma: PrismaService) {}

  async create(createModeloCasaDto: CreateModeloCasaDto) {
    const { materiais, placas, ...modeloData } = createModeloCasaDto;
    return this.prisma.$transaction(async (tx) => {
      const novoModelo = await tx.modelo_casa.create({ data: modeloData });

      if (materiais && materiais.length > 0) {
        const materiaisParaCriar = materiais.map((m) => ({
          modelo_casa_id: novoModelo.id,
          material_id: m.materialId,
          qt_modelo: m.qt_modelo,
        }));
        await tx.materiais_modelo_casa.createMany({ data: materiaisParaCriar });
      }

      if (placas && placas.length > 0) {
        const placasParaCriar = placas.map((p) => ({
          modelo_casa_id: novoModelo.id,
          placa_id: p.placaId,
          qt_placa: p.qt_placa,
        }));
        await tx.placas_modelo_casa.createMany({ data: placasParaCriar });
      }

      return this.findOne(novoModelo.id, tx);
    });
  }

  findAll() {
    return this.prisma.modelo_casa.findMany({
      where: { deleted_at: null },
      orderBy: { nome: 'asc' },
      include: {
        materiais_modelo_casa: {
          orderBy: { materiais_estoque: { item: 'asc' } },
          include: { materiais_estoque: true },
        },
        placas_modelo_casa: {
          include: { placas: true },
        },
      },
    });
  }

  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const modelo = await prisma.modelo_casa.findUnique({
      where: { id, deleted_at: null },
      include: {
        materiais_modelo_casa: {
          include: { materiais_estoque: true },
        },
        placas_modelo_casa: {
          include: { placas: true },
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

  async update(id: number, updateModeloCasaDto: UpdateModeloCasaDto) {
    const { materiais, placas, ...modeloData } = updateModeloCasaDto;
    return this.prisma.$transaction(async (tx) => {
      await this.findOne(id, tx);

      await tx.modelo_casa.update({
        where: { id },
        data: modeloData,
      });

      if (materiais) {
        await tx.materiais_modelo_casa.deleteMany({
          where: { modelo_casa_id: id },
        });
        const materiaisParaCriar = materiais.map((m) => ({
          modelo_casa_id: id,
          material_id: m.materialId,
          qt_modelo: m.qt_modelo,
        }));
        await tx.materiais_modelo_casa.createMany({ data: materiaisParaCriar });
      }

      if (placas) {
        await tx.placas_modelo_casa.deleteMany({
          where: { modelo_casa_id: id },
        });
        const placasParaCriar = placas.map((p) => ({
          modelo_casa_id: id,
          placa_id: p.placaId,
          qt_placa: p.qt_placa,
        }));
        await tx.placas_modelo_casa.createMany({ data: placasParaCriar });
      }

      return this.findOne(id, tx);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.modelo_casa.delete({ where: { id } });
    return { message: 'Modelo de casa removido com sucesso.' };
  }
}
