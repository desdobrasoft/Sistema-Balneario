import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { formatDecimal } from '../common/utils/format.utils';
import { Corte } from '../generated/prisma/client';
import { GeometriaPlaca, VetorCorte } from '../placas/utils/geometria.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCorteDto, UpdateCorteDto } from './dto/corte.dto';

/** Estrutura de um Corte retornado pelo Prisma (campos relevantes para o DataTable) */
type CorteRow = Omit<Corte, 'percurso'> & {
  percurso: VetorCorte[];
};

@Injectable()
export class CortesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCorteDto) {
    const pontos = GeometriaPlaca.percursoParaPontos(
      { x: 0, y: 0 },
      dto.percurso,
    );
    const bbox = GeometriaPlaca.calcularBoundingBox(pontos);
    const existing = await this.prisma.corte.findUnique({
      where: { nome: dto.nome },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Se existe mas está excluído, vamos restaurá-lo com os novos dados (overwrite)
        return await this.prisma.corte.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            percurso: dto.percurso as any,
            largura: bbox.width,
            altura: bbox.height,
            pontos: pontos as any,
          },
        });
      }
      throw new ConflictException(
        'Já existe um corte cadastrado com este nome.',
      );
    }

    return await this.prisma.corte.create({
      data: {
        nome: dto.nome,
        percurso: dto.percurso as any,
        largura: bbox.width,
        altura: bbox.height,
        pontos: pontos as any,
      },
    });
  }

  async findAll() {
    return this.prisma.corte.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'desc' },
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.corte,
      query,
      searchableFields: ['nome'],
      baseWhere: { deletedAt: null },
      filterRequestedFields: false,
      mapRow: (corte: CorteRow) => {
        const isRetangular = GeometriaPlaca.eRetangulo(corte.percurso);
        const dimensoes = isRetangular
          ? `${formatDecimal(corte.largura)} x ${formatDecimal(corte.altura)}`
          : corte.percurso.map((p) => formatDecimal(p.distancia)).join(' x ');
        return {
          ...corte,
          dimensoes,
        };
      },
    });
  }

  async findOne(id: number) {
    const corte = await this.prisma.corte.findUnique({ where: { id } });
    if (!corte || corte.deletedAt)
      throw new NotFoundException(`Corte com ID ${id} não encontrado.`);
    return corte;
  }

  async update(id: number, dto: UpdateCorteDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.nome) {
      const existing = await this.prisma.corte.findFirst({
        where: { nome: dto.nome, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(
          'Já existe um corte cadastrado com este nome.',
        );
      }
      data.nome = dto.nome;
    }

    if (dto.percurso) {
      const pontos = GeometriaPlaca.percursoParaPontos(
        { x: 0, y: 0 },
        dto.percurso,
      );
      const bbox = GeometriaPlaca.calcularBoundingBox(pontos);
      Object.assign(data, {
        percurso: dto.percurso as any,
        largura: bbox.width,
        altura: bbox.height,
        pontos: pontos as any,
      });
    }

    return await this.prisma.corte.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.corte.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Corte removido com sucesso.' };
  }
}
