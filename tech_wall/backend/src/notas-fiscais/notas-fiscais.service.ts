import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import {
  buildSearchFilter,
  getIdsByNumericPartialMatch,
} from '../common/utils/prisma-search.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotaFiscalDto } from './dto/create-nota-fiscal.dto';

@Injectable()
export class NotasFiscaisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotaFiscalDto) {
    return this.prisma.notaFiscal.create({
      data: {
        nomeArquivo: dto.nomeArquivo,
        tipoArquivo: dto.tipoArquivo,
        arquivoBase64: dto.arquivoBase64,
        lancamentos: {
          create: dto.lancamentoIds.map((lancamentoId) => ({
            lancamentoId,
          })),
        },
      },
      include: {
        lancamentos: {
          include: { lancamento: true },
        },
      },
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    const { start = 0, length = 10, search, draw = 1 } = query;
    const skip = start;
    const limit = length;
    const searchValue = search?.value || '';

    const baseWhere: any = {};
    let where = { ...baseWhere };

    if (searchValue) {
      const idsByValues = await getIdsByNumericPartialMatch(
        this.prisma,
        'notas_fiscais',
        ['id'],
        searchValue,
      );

      const searchFilter = buildSearchFilter(searchValue, [
        'nomeArquivo',
        'tipoArquivo',
      ]);

      if (idsByValues.length > 0) {
        if (searchFilter.OR) {
          searchFilter.OR.push({
            id: { in: idsByValues.map((id) => Number(id)) },
          });
        } else {
          searchFilter.OR = [
            { id: { in: idsByValues.map((id) => Number(id)) } },
          ];
        }
      }

      where = { ...baseWhere, ...searchFilter };
    }

    const [data, total, filtered] = await Promise.all([
      this.prisma.notaFiscal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nomeArquivo: true,
          tipoArquivo: true,
          createdAt: true,
          _count: { select: { lancamentos: true } },
        },
      }),
      this.prisma.notaFiscal.count({ where: baseWhere }),
      this.prisma.notaFiscal.count({ where }),
    ]);

    return {
      draw,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async findOne(id: number) {
    const nf = await this.prisma.notaFiscal.findUnique({
      where: { id },
      include: {
        lancamentos: {
          include: {
            lancamento: true,
          },
        },
      },
    });
    if (!nf)
      throw new NotFoundException(`Nota Fiscal com ID ${id} não encontrada.`);
    return nf;
  }

  async download(id: number) {
    const nf = await this.prisma.notaFiscal.findUnique({
      where: { id },
      select: {
        nomeArquivo: true,
        tipoArquivo: true,
        arquivoBase64: true,
      },
    });
    if (!nf)
      throw new NotFoundException(`Nota Fiscal com ID ${id} não encontrada.`);
    return nf;
  }

  async remove(id: number) {
    const nf = await this.prisma.notaFiscal.findUnique({ where: { id } });
    if (!nf)
      throw new NotFoundException(`Nota Fiscal com ID ${id} não encontrada.`);

    await this.prisma.notaFiscal.delete({ where: { id } });
    return { message: 'Nota fiscal removida com sucesso.' };
  }
}
