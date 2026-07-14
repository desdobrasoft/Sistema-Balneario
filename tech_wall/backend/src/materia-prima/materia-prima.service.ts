import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { formatDecimal } from '../common/utils/format.utils';
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

  // TRADE-OFF: The previous implementation used in-memory sort to prioritize items
  // below estoqueMinimo. This has been replaced with Prisma-native orderBy ({ item: 'asc' })
  // for consistency with PrismaDatatableHelper.execute(). To restore the "low stock first"
  // behavior at DB level, consider adding a computed/virtual column or a raw SQL orderBy.
  async findAll(query: DataTableParamsDto): Promise<DataTableResult<any>> {
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.materiaPrima,
      prismaClient: this.prisma,
      query,
      searchableFields: ['item', 'unidade'],
      numericSearchFields: ['quantidade', 'estoqueMinimo'],
      tableName: 'materia_prima',
      defaultOrderBy: { item: 'asc' },
      mapRow: (item: any) => ({
        id: item.id,
        item: item.item,
        unidade: item.unidade,
        quantidade: formatDecimal(item.quantidade),
        estoqueMinimo: formatDecimal(item.estoqueMinimo),
        deletedAt: item.deletedAt,
      }),
      filterRequestedFields: false,
    });
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
