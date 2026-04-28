import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { getIdsByNumericPartialMatch } from '../common/utils/prisma-search.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTramaDto } from './dto/create-trama.dto';
import { UpdateTramaDto } from './dto/update-trama.dto';

@Injectable()
export class TramasService {
  constructor(private prisma: PrismaService) {}

  private validateCortesSum(cortes: number[], alturaBase: number) {
    if (!cortes || cortes.length === 0) return;
    const sum = cortes.reduce((acc, val) => acc + Number(val), 0);
    if (Math.round(sum * 100) !== Math.round(Number(alturaBase) * 100)) {
      throw new BadRequestException(
        'A soma dos cortes deve ser exatamente igual à altura base.',
      );
    }
  }

  async create(createTramaDto: CreateTramaDto) {
    this.validateCortesSum(createTramaDto.cortes, createTramaDto.alturaBase);

    const tramaExists = await this.prisma.trama.findUnique({
      where: { nome: createTramaDto.nome },
    });

    if (tramaExists) {
      throw new ConflictException('Já existe uma Trama com este nome.');
    }

    return this.prisma.trama.create({
      data: createTramaDto,
    });
  }

  async findAll() {
    return this.prisma.trama.findMany({
      orderBy: { id: 'desc' },
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
    } = PrismaDatatableHelper.buildPrismaQuery(query, [
      'nome',
      'direcionamento',
    ]);

    let finalWhere = { ...generatedWhere };

    if (query.search?.value) {
      const searchVal = query.search.value;
      const idsByValues = await getIdsByNumericPartialMatch(
        this.prisma,
        'tramas',
        ['id', 'altura_base', 'profundidade_saliencia', 'cortes'],
        searchVal,
      );

      if (idsByValues.length > 0) {
        if (finalWhere.OR) {
          finalWhere.OR.push({ id: { in: idsByValues } });
        } else {
          finalWhere.OR = [{ id: { in: idsByValues } }];
        }
      }
    }

    const [rawData, total, filtered] = await Promise.all([
      this.prisma.trama.findMany({
        where: finalWhere,
        skip,
        take,
        orderBy: Object.keys(orderBy).length ? orderBy : { id: 'desc' },
      }),
      this.prisma.trama.count(),
      this.prisma.trama.count({ where: finalWhere }),
    ]);

    const requestedFields = (query.columns
      ?.map((c) => c.data)
      .filter((d) => d && d !== 'null') || []) as string[];

    const data = rawData.map((trama) => {
      const flatObj: any = {
        id: trama.id,
        nome: trama.nome,
        alturaBase: Number(trama.alturaBase).toFixed(2),
        profundidadeSaliencia: Number(trama.profundidadeSaliencia).toFixed(2),
        direcionamento: trama.direcionamento,
        cortes: trama.cortes,
        createdAt: trama.createdAt,
        updatedAt: trama.updatedAt,
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
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async findOne(id: number) {
    const trama = await this.prisma.trama.findUnique({
      where: { id },
    });

    if (!trama) {
      throw new NotFoundException(`Trama com ID ${id} não encontrada.`);
    }

    return trama;
  }

  async update(id: number, updateTramaDto: UpdateTramaDto) {
    const trama = await this.findOne(id);

    const newCortes = updateTramaDto.cortes ?? trama.cortes;
    const newAlturaBase = updateTramaDto.alturaBase ?? Number(trama.alturaBase);

    this.validateCortesSum(newCortes as number[], Number(newAlturaBase));

    return this.prisma.trama.update({
      where: { id },
      data: updateTramaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // As in other models, either delete or rely on Cascade if relation is set.
    // The Tramas relation in Placa does not CASCADE delete Placa, but might restrict.
    try {
      await this.prisma.trama.delete({
        where: { id },
      });
      return { message: 'Trama removida com sucesso.' };
    } catch (e) {
      throw new ConflictException(
        'Não é possível excluir esta Trama, ela pode estar em uso por Placas.',
      );
    }
  }
}
