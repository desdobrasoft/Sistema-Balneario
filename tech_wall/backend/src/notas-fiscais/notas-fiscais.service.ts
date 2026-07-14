import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
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
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.notaFiscal,
      prismaClient: this.prisma,
      query,
      searchableFields: ['nomeArquivo', 'tipoArquivo'],
      numericSearchFields: ['id'],
      tableName: 'notas_fiscais',
      defaultOrderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nomeArquivo: true,
        tipoArquivo: true,
        createdAt: true,
        _count: { select: { lancamentos: true } },
      },
      filterRequestedFields: false,
    });
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
