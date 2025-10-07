import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlacaDto } from './dto/create-placa.dto';
import { GerenciarProducaoPlacaDto } from './dto/gerenciar-producao-placa.dto';
import { UpdatePlacaDto } from './dto/update-placa.dto';

@Injectable()
export class PlacasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlacaDto) {
    const { materiais, ...placaData } = dto;

    const placaExists = await this.prisma.placas.findUnique({
      where: { nome: placaData.nome },
    });

    if (placaExists) {
      throw new ConflictException('Uma placa com este nome já existe.');
    }

    return this.prisma.$transaction(async (tx) => {
      const placa = await tx.placas.create({
        data: placaData,
      });

      if (materiais && materiais.length > 0) {
        await tx.materiais_placa.createMany({
          data: materiais.map((m) => ({
            placa_id: placa.id,
            material_id: m.material_id,
            quantidade: m.quantidade,
          })),
        });
      }

      return this.findOne(placa.id, tx);
    });
  }

  findAll() {
    return this.prisma.placas.findMany({
      orderBy: { nome: 'asc' },
      include: {
        materiais_placa: {
          include: {
            materiais_estoque: true,
          },
        },
      },
    });
  }

  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const placa = await prisma.placas.findUnique({
      where: { id },
      include: {
        materiais_placa: {
          include: {
            materiais_estoque: true,
          },
        },
      },
    });

    if (!placa) {
      throw new NotFoundException(`Placa com ID "${id}" não encontrada.`);
    }
    return placa;
  }

  async update(id: number, dto: UpdatePlacaDto) {
    await this.findOne(id);
    const { materiais, ...placaData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const updatedPlaca = await tx.placas.update({
        where: { id },
        data: placaData,
      });

      if (materiais) {
        // Delete existing materials and create new ones
        await tx.materiais_placa.deleteMany({ where: { placa_id: id } });
        if (materiais.length > 0) {
          await tx.materiais_placa.createMany({
            data: materiais.map((m) => ({
              placa_id: id,
              material_id: m.material_id,
              quantidade: m.quantidade,
            })),
          });
        }
      }

      return this.findOne(id, tx);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.placas.delete({ where: { id } });
    return { message: 'Placa removida com sucesso.' };
  }

  async gerenciarProducao(id: number, dto: GerenciarProducaoPlacaDto) {
    const { iniciarProducao, finalizarProducao } = dto;

    if (!iniciarProducao && !finalizarProducao) {
      throw new BadRequestException(
        'Especifique a quantidade para iniciar ou finalizar a produção.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const placa = await this.findOne(id, tx);

      // Lógica para iniciar produção
      if (iniciarProducao && iniciarProducao > 0) {
        if (placa.qt_aguardando_producao < iniciarProducao) {
          throw new BadRequestException(
            `Não há placas suficientes aguardando produção. Disponível: ${placa.qt_aguardando_producao}`,
          );
        }

        // Verificar se há material em estoque
        for (const materialPlaca of placa.materiais_placa) {
          const materialEstoque = await tx.materiais_estoque.findUnique({
            where: { id: materialPlaca.material_id },
          });

          if (
            !materialEstoque ||
            materialEstoque.quantidade <
              materialPlaca.quantidade * iniciarProducao
          ) {
            throw new BadRequestException(
              `Material insuficiente em estoque: ${materialPlaca.materiais_estoque.item}`,
            );
          }
        }

        // Debitar materiais do estoque
        for (const materialPlaca of placa.materiais_placa) {
          await tx.materiais_estoque.update({
            where: { id: materialPlaca.material_id },
            data: {
              quantidade: {
                decrement: materialPlaca.quantidade * iniciarProducao,
              },
            },
          });
        }

        // Atualizar quantidades da placa
        await tx.placas.update({
          where: { id },
          data: {
            qt_aguardando_producao: {
              decrement: iniciarProducao,
            },
            qt_em_producao: {
              increment: iniciarProducao,
            },
          },
        });
      }

      // Lógica para finalizar produção
      if (finalizarProducao && finalizarProducao > 0) {
        const placaAtualizada = await tx.placas.findUnique({ where: { id } }); // Re-fetch
        if (!placaAtualizada) {
          throw new NotFoundException(`Placa com ID "${id}" não encontrada.`);
        }

        if (
          placaAtualizada.qt_em_producao === null ||
          placaAtualizada.qt_em_producao < finalizarProducao
        ) {
          throw new BadRequestException(
            `Não há placas suficientes em produção. Disponível: ${
              placaAtualizada.qt_em_producao ?? 0
            }`,
          );
        }

        await tx.placas.update({
          where: { id },
          data: {
            qt_em_producao: {
              decrement: finalizarProducao,
            },
            qt_pronta: {
              increment: finalizarProducao,
            },
          },
        });
      }

      return this.findOne(id, tx);
    });
  }
}
