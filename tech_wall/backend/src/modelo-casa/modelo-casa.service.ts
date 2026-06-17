import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { getIdsByNumericPartialMatch } from '../common/utils/prisma-search.utils';
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
          largura: r.largura || null,
          altura: r.altura || null,
          espessura: r.espessura || null,
          tramaEsquerdaId: r.tramaEsquerdaId || null,
          tramaDireitaId: r.tramaDireitaId || null,
          tramaSuperiorId: r.tramaSuperiorId || null,
          tramaInferiorId: r.tramaInferiorId || null,
          corteId: r.corteId || null,
          reforco: r.reforco || null,
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
    const {
      skip,
      take,
      where: generatedWhere,
      orderBy,
    } = PrismaDatatableHelper.buildPrismaQuery(
      query,
      ['nome', 'descricao', 'materiaisModeloCasa.some.materiaPrima.item'],
      { deletedAt: null },
    );

    const where = { ...generatedWhere };

    if (query.search?.value) {
      const searchVal = query.search.value;
      const idsByPrice = await getIdsByNumericPartialMatch(
        this.prisma,
        'modelo_casa',
        ['preco'],
        searchVal,
      );

      if (idsByPrice.length > 0) {
        if (where.OR) {
          where.OR.push({ id: { in: idsByPrice } });
        } else {
          where.OR = [{ id: { in: idsByPrice } }];
        }
      }
    }

    const [data, total, filtered] = await Promise.all([
      this.prisma.modeloCasa.findMany({
        where,
        skip,
        take,
        orderBy: Object.keys(orderBy as Record<string, unknown>).length
          ? orderBy
          : { id: 'desc' },
        include: {
          materiaisModeloCasa: {
            orderBy: { materiaPrima: { item: 'asc' } },
            include: { materiaPrima: true },
          },
          requisitos: {
            include: { corte: true },
          },
        },
      }),
      this.prisma.modeloCasa.count({ where: { deletedAt: null } }),
      this.prisma.modeloCasa.count({ where }),
    ]);

    const requestedFields = (query.columns
      ?.map((c) => c.data)
      .filter((d) => d && d !== 'null') || []) as string[];

    const finalData = data.map((modelo: any) => {
      const flatObj: any = {
        id: modelo.id,
        nome: modelo.nome,
        descricao: modelo.descricao,
        tempoFabricacao: modelo.tempoFabricacao,
        preco: modelo.preco,
        createdAt: modelo.createdAt,
        updatedAt: modelo.updatedAt,
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

  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const modelo = await prisma.modeloCasa.findUnique({
      where: { id, deletedAt: null },
      include: {
        materiaisModeloCasa: {
          include: { materiaPrima: true },
        },
        requisitos: {
          include: { corte: true },
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
          largura: r.largura || null,
          altura: r.altura || null,
          espessura: r.espessura || null,
          tramaEsquerdaId: r.tramaEsquerdaId || null,
          tramaDireitaId: r.tramaDireitaId || null,
          tramaSuperiorId: r.tramaSuperiorId || null,
          tramaInferiorId: r.tramaInferiorId || null,
          corteId: r.corteId || null,
          reforco: r.reforco || null,
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
