import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { formatDecimal } from '../common/utils/format.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModeloCasaDto } from './dto/create-modelo-casa.dto';
import { UpdateModeloCasaDto } from './dto/update-modelo-casa.dto';

@Injectable()
export class ModeloCasaService {
  constructor(private prisma: PrismaService) {}

  async create(createModeloCasaDto: CreateModeloCasaDto) {
    const { materiais, requisitos, suprimentosObra, ...modeloData } =
      createModeloCasaDto;
    return this.prisma.$transaction(async (tx) => {
      const novoModelo = await tx.modeloCasa.create({
        data: {
          ...modeloData,
          suprimentosObra: suprimentosObra || [],
        },
      });

      if (materiais && materiais.length > 0) {
        const materiaisParaCriar = materiais.map((m) => ({
          modeloCasaId: novoModelo.id,
          materiaPrimaId: m.materiaPrimaId,
          qtModelo: m.qtModelo,
        }));
        await tx.materialModeloCasa.createMany({ data: materiaisParaCriar });
      }

      if (requisitos && requisitos.length > 0) {
        const reqsParaCriar = requisitos.map((r) => ({
          modeloCasaId: novoModelo.id,
          tipo: r.tipo,
          alias: r.alias || null,
          parede: r.parede || 'Geral',
          tipoPlacaId: r.tipoPlacaId,
          corteId: r.corteId || null,
        }));
        await tx.requisitoModeloCasa.createMany({ data: reqsParaCriar });
      }

      return this.findOne(novoModelo.id, tx);
    });
  }

  async findAll() {
    return this.prisma.modeloCasa.findMany({
      orderBy: { id: 'desc' },
      where: { deletedAt: null },
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.modeloCasa,
      prismaClient: this.prisma,
      query,
      searchableFields: [
        'nome',
        'descricao',
        'materiaisModeloCasa.some.materiaPrima.item',
      ],
      numericSearchFields: ['preco'],
      tableName: 'modelo_casa',
      baseWhere: { deletedAt: null },
      include: {
        materiaisModeloCasa: {
          orderBy: { materiaPrima: { item: 'asc' } },
          include: { materiaPrima: true },
        },
        requisitos: {
          include: {
            corte: true,
            tipoPlaca: {
              include: {
                tramaEsquerda: true,
                tramaDireita: true,
                tramaSuperior: true,
                tramaInferior: true,
              },
            },
          },
        },
      },
      mapRow: (modelo) => ({
        id: modelo.id,
        nome: modelo.nome,
        descricao: modelo.descricao,
        tempoFabricacao: modelo.tempoFabricacao,
        preco: formatDecimal(modelo.preco),
        imagemBase64: modelo.imagemBase64,
        createdAt: modelo.createdAt,
        updatedAt: modelo.updatedAt,
      }),
      filterRequestedFields: false,
    });
  }

  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const modelo = await prisma.modeloCasa.findUnique({
      where: { id, deletedAt: null },
      include: {
        materiaisModeloCasa: {
          include: { materiaPrima: true },
        },
        requisitos: {
          include: {
            corte: true,
            tipoPlaca: {
              include: {
                tramaEsquerda: true,
                tramaDireita: true,
                tramaSuperior: true,
                tramaInferior: true,
              },
            },
          },
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
    const { materiais, requisitos, suprimentosObra, ...modeloData } =
      updateModeloCasaDto;
    return this.prisma.$transaction(async (tx) => {
      await this.findOne(id, tx);

      await tx.modeloCasa.update({
        where: { id },
        data: {
          ...modeloData,
          suprimentosObra: suprimentosObra || undefined,
        },
      });

      if (materiais) {
        await tx.materialModeloCasa.deleteMany({
          where: { modeloCasaId: id },
        });
        const materiaisParaCriar = materiais.map((m) => ({
          modeloCasaId: id,
          materiaPrimaId: m.materiaPrimaId,
          qtModelo: m.qtModelo,
        }));
        await tx.materialModeloCasa.createMany({ data: materiaisParaCriar });
      }

      if (requisitos) {
        await tx.requisitoModeloCasa.deleteMany({
          where: { modeloCasaId: id },
        });
        const reqsParaCriar = requisitos.map((r) => ({
          modeloCasaId: id,
          tipo: r.tipo,
          alias: r.alias || null,
          parede: r.parede || 'Geral',
          tipoPlacaId: r.tipoPlacaId,
          corteId: r.corteId || null,
        }));
        await tx.requisitoModeloCasa.createMany({ data: reqsParaCriar });
      }

      return this.findOne(id, tx);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.modeloCasa.delete({ where: { id } });
    return { message: 'Modelo de casa removido com sucesso.' };
  }
}
