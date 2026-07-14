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
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoPlacaDto } from './dto/create-tipo-placa.dto';
import { UpdateTipoPlacaDto } from './dto/update-tipo-placa.dto';

@Injectable()
export class TiposPlacaService {
  constructor(private prisma: PrismaService) {}

  private processTramas(dto: CreateTipoPlacaDto | UpdateTipoPlacaDto) {
    const data: any = { ...dto };
    delete data.materiais;

    if (data.tramaEsquerdaAtiva === false) data.tramaEsquerdaId = null;
    if (data.tramaDireitaAtiva === false) data.tramaDireitaId = null;
    if (data.tramaSuperiorAtiva === false) data.tramaSuperiorId = null;
    if (data.tramaInferiorAtiva === false) data.tramaInferiorId = null;

    return data;
  }

  async create(createTipoPlacaDto: CreateTipoPlacaDto) {
    const exists = await this.prisma.tipoPlaca.findFirst({
      where: { nome: createTipoPlacaDto.nome, deletedAt: null },
    });

    if (exists) {
      throw new ConflictException('Já existe um Tipo de Placa com este nome.');
    }

    const data = this.processTramas(createTipoPlacaDto);
    const materiais = createTipoPlacaDto.materiais || [];

    return this.prisma.$transaction(async (tx) => {
      const tipoPlaca = await tx.tipoPlaca.create({ data });

      if (materiais.length > 0) {
        await tx.materialTipoPlaca.createMany({
          data: materiais.map((m) => ({
            tipoPlacaId: tipoPlaca.id,
            materiaPrimaId: m.materiaPrimaId,
            quantidade: m.quantidade,
          })),
        });
      }

      return tx.tipoPlaca.findUnique({
        where: { id: tipoPlaca.id },
        include: {
          materiais: { include: { materiaPrima: true } },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.tipoPlaca.findMany({
      where: { deletedAt: null },
      include: {
        materiais: { include: { materiaPrima: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.tipoPlaca,
      prismaClient: this.prisma,
      query,
      searchableFields: ['nome'],
      numericSearchFields: ['id', 'altura', 'largura', 'espessura'],
      tableName: 'tipos_placa',
      baseWhere: { deletedAt: null },
      mapRow: (tp: any) => ({
        id: tp.id,
        nome: tp.nome,
        altura: formatDecimal(tp.altura),
        largura: formatDecimal(tp.largura),
        espessura: formatDecimal(tp.espessura),
        reforco: tp.reforco,
        createdAt: tp.createdAt,
        updatedAt: tp.updatedAt,
      }),
    });
  }

  async findOne(id: number) {
    const tipoPlaca = await this.prisma.tipoPlaca.findUnique({
      where: { id },
      include: {
        materiais: { include: { materiaPrima: true } },
      },
    });

    if (!tipoPlaca || tipoPlaca.deletedAt) {
      throw new NotFoundException(`Tipo de Placa com ID ${id} não encontrado.`);
    }

    return tipoPlaca;
  }

  async update(id: number, updateTipoPlacaDto: UpdateTipoPlacaDto) {
    await this.findOne(id);

    if (updateTipoPlacaDto.nome) {
      const exists = await this.prisma.tipoPlaca.findFirst({
        where: {
          nome: updateTipoPlacaDto.nome,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (exists) {
        throw new ConflictException(
          'Já existe um Tipo de Placa com este nome.',
        );
      }
    }

    const data = this.processTramas(updateTipoPlacaDto);
    const materiais = updateTipoPlacaDto.materiais;

    return this.prisma.$transaction(async (tx) => {
      await tx.tipoPlaca.update({ where: { id }, data });

      if (materiais !== undefined) {
        await tx.materialTipoPlaca.deleteMany({
          where: { tipoPlacaId: id },
        });

        if (materiais.length > 0) {
          await tx.materialTipoPlaca.createMany({
            data: materiais.map((m) => ({
              tipoPlacaId: id,
              materiaPrimaId: m.materiaPrimaId,
              quantidade: m.quantidade,
            })),
          });
        }
      }

      return tx.tipoPlaca.findUnique({
        where: { id },
        include: {
          materiais: { include: { materiaPrima: true } },
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const placasEmUso = await this.prisma.placa.count({
      where: { tipoPlacaId: id, deletedAt: null },
    });

    if (placasEmUso > 0) {
      throw new ConflictException(
        'Não é possível excluir este Tipo de Placa, existem Placas vinculadas a ele.',
      );
    }

    await this.prisma.tipoPlaca.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Tipo de Placa removido com sucesso.' };
  }
}
