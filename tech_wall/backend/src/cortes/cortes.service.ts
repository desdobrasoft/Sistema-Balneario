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
import { GeometriaPlaca, VetorCorte } from '../placas/utils/geometria.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCorteDto, UpdateCorteDto } from './dto/corte.dto';

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
    const { skip, take, where, orderBy } =
      PrismaDatatableHelper.buildPrismaQuery(query, ['nome'], {
        deletedAt: null,
      });

    const [dataRaw, total, filtered] = await Promise.all([
      this.prisma.corte.findMany({
        where,
        skip,
        take,
        orderBy: Object.keys(orderBy as Record<string, unknown>).length
          ? orderBy
          : { id: 'desc' },
      }),
      this.prisma.corte.count({ where: { deletedAt: null } }),
      this.prisma.corte.count({ where }),
    ]);

    const data = dataRaw.map((corte) => {
      const isRetangular = GeometriaPlaca.eRetangulo(
        corte.percurso as unknown as VetorCorte[],
      );
      const dimensoes = isRetangular
        ? `${Number(corte.largura).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} x ${Number(corte.altura).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
        : (corte.percurso as unknown as VetorCorte[])
            .map((p) =>
              Number(p.distancia).toLocaleString('pt-BR', {
                maximumFractionDigits: 2,
              }),
            )
            .join(' x ');
      return {
        ...corte,
        dimensoes,
      };
    });

    return {
      draw: query.draw || 1,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
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
