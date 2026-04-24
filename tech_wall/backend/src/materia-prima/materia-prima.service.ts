import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { getIdsByNumericPartialMatch } from '../common/utils/prisma-search.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { UpdateMateriaPrimaDto } from './dto/update-materia-prima.dto';

@Injectable()
export class MateriaPrimaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMateriaPrimaDto) {
    const materiaPrima = await this.prisma.materiaPrima.create({
      data: dto,
    });

    return this.findOne(materiaPrima.id);
  }

  async findAllRaw() {
    return this.prisma.materiaPrima.findMany({
      where: { deletedAt: null },
      orderBy: { item: 'asc' },
    });
  }

  async findAll(query: DataTableParamsDto): Promise<DataTableResult<any>> {
    const {
      skip,
      take,
      where: generatedWhere,
    } = PrismaDatatableHelper.buildPrismaQuery(query, ['item', 'unidade']);

    let finalWhere = { ...generatedWhere };

    if (query.search?.value) {
      const searchVal = query.search.value;
      const idsByQuantity = await getIdsByNumericPartialMatch(
        this.prisma,
        'materia_prima',
        ['quantidade', 'estoque_minimo'],
        searchVal,
      );

      if (idsByQuantity.length > 0) {
        if (finalWhere.OR) {
          finalWhere.OR.push({
            id: { in: idsByQuantity.map((id) => Number(id)) },
          });
        } else {
          finalWhere.OR = [
            { id: { in: idsByQuantity.map((id) => Number(id)) } },
          ];
        }
      }
    }

    // Fetch all matching data to sort them globally in memory by availability
    let allData = await this.prisma.materiaPrima.findMany({
      where: finalWhere,
      orderBy: { item: 'asc' }, // fallback sort
    });

    // Custom Sort: Items below limit should come first
    allData.sort((a, b) => {
      const aIsLow = a.estoqueMinimo && a.quantidade < a.estoqueMinimo;
      const bIsLow = b.estoqueMinimo && b.quantidade < b.estoqueMinimo;
      if (aIsLow && !bIsLow) return -1;
      if (!aIsLow && bIsLow) return 1;
      return 0; // maintain alphabetical order otherwise
    });

    const total = await this.prisma.materiaPrima.count();
    const filtered = allData.length;

    // Manual Pagination
    const data = allData.slice(skip, skip + take);

    return {
      draw: query.draw || 1,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async findOne(id: number, tx?: any) {
    const prisma = tx ?? this.prisma;
    const materiaPrima = await prisma.materiaPrima.findUnique({
      where: { id },
    });

    if (!materiaPrima) {
      throw new NotFoundException(
        `Matéria Prima com ID "${id}" não encontrada.`,
      );
    }
    return materiaPrima;
  }

  async update(id: number, dto: UpdateMateriaPrimaDto) {
    await this.findOne(id);

    await this.prisma.materiaPrima.update({
      where: { id },
      data: dto,
    });

    return this.findOne(id);
  }

  async getDashboardStats() {
    const [allMateriais, ultimaEntrada, ultimaSaida] = await Promise.all([
      this.prisma.materiaPrima.findMany({
        where: { deletedAt: null },
        select: { id: true, quantidade: true, estoqueMinimo: true },
      }),
      this.prisma.movimentacaoMaterial.findFirst({
        where: { tipoMovimentacao: 'I' },
        orderBy: { dataMovimentacao: 'desc' },
        select: { dataMovimentacao: true },
      }),
      this.prisma.movimentacaoMaterial.findFirst({
        where: { tipoMovimentacao: 'O' },
        orderBy: { dataMovimentacao: 'desc' },
        select: { dataMovimentacao: true },
      }),
    ]);

    const itensDistintos = allMateriais.length;
    const estoqueBaixo = allMateriais.filter(
      (m) => m.estoqueMinimo != null && m.quantidade < m.estoqueMinimo,
    ).length;

    return {
      itensDistintos,
      estoqueBaixo,
      ultimaEntrada: ultimaEntrada?.dataMovimentacao || null,
      ultimaSaida: ultimaSaida?.dataMovimentacao || null,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.materiaPrima.delete({ where: { id } });
    return { message: 'Matéria Prima removida com sucesso.' };
  }
}
