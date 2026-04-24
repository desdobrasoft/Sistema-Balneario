import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusPagamentoVenda } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';

import {
  DataTableParamsDto,
  DataTableResult,
} from '../../common/dto/data-table.dto';
import {
  buildSearchFilter,
  getIdsByNumericPartialMatch,
} from '../../common/utils/prisma-search.utils';

@Injectable()
export class LancamentosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLancamentoDto) {
    // Validação da regra de negócio: referências mutuamente exclusivas
    if (dto.vendaId && dto.movimentacaoMaterialId) {
      throw new BadRequestException(
        'Um lançamento não pode estar associado a uma Venda e a uma Movimentação de Material ao mesmo tempo.',
      );
    }

    return this.prisma.lancamentoFinanceiro.create({
      data: {
        tipo: dto.tipo,
        descricao: dto.descricao,
        valorTotal: dto.valorTotal,
        valorPendente: dto.valorTotal, // Inicialmente, nada foi pago
        dataVencimento: dto.dataVencimento
          ? new Date(dto.dataVencimento)
          : null,
        statusPagamento: StatusPagamentoVenda.PENDENTE,
        vendaId: dto.vendaId,
        movimentacaoMaterialId: dto.movimentacaoMaterialId,
      },
    });
  }

  async findAllRaw() {
    return this.prisma.lancamentoFinanceiro.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        venda: { include: { cliente: true } },
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
        'lancamentos_financeiros',
        ['valor_total', 'valor_pendente', 'id', 'venda_id'],
        searchValue,
      );

      const searchFilter = buildSearchFilter(searchValue, [
        'descricao',
        'statusPagamento',
        'venda.cliente.nome',
      ]);

      if (idsByValues.length > 0) {
        if (searchFilter.OR) {
          searchFilter.OR.push({ id: { in: idsByValues } });
        } else {
          searchFilter.OR = [{ id: { in: idsByValues } }];
        }
      }

      where = { ...baseWhere, ...searchFilter };
    }

    const [data, total, filtered] = await Promise.all([
      this.prisma.lancamentoFinanceiro.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataVencimento: 'asc' },
        include: {
          venda: { include: { cliente: true } },
        },
      }),
      this.prisma.lancamentoFinanceiro.count({ where: baseWhere }),
      this.prisma.lancamentoFinanceiro.count({ where }),
    ]);

    return {
      draw,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  async findOne(id: number) {
    const lancamento = await this.prisma.lancamentoFinanceiro.findUnique({
      where: { id },
      include: { venda: true, movimentacaoMaterial: true },
    });
    if (!lancamento)
      throw new NotFoundException(`Lançamento com ID ${id} não encontrado.`);
    return lancamento;
  }

  async update(id: number, dto: UpdateLancamentoDto) {
    const lancamentoAtual = await this.findOne(id);

    const valorPagoNestaTransacao = dto.valorPago ?? 0;
    const novoValorPendente = lancamentoAtual.valorPendente.minus(
      valorPagoNestaTransacao,
    );

    if (novoValorPendente.isNegative()) {
      throw new BadRequestException(
        'O valor pago não pode ser maior que o valor pendente.',
      );
    }

    // Lógica para atualizar o status automaticamente com base no pagamento
    let novoStatusPagamento =
      dto.statusPagamento ?? lancamentoAtual.statusPagamento;
    if (dto.valorPago) {
      // Se um pagamento foi feito
      if (novoValorPendente.isZero()) {
        novoStatusPagamento = StatusPagamentoVenda.PAGO;
      } else {
        novoStatusPagamento = StatusPagamentoVenda.PAGO_PARCIALMENTE;
      }
    }

    return this.prisma.lancamentoFinanceiro.update({
      where: { id },
      data: {
        descricao: dto.descricao,
        dataVencimento: dto.dataVencimento
          ? new Date(dto.dataVencimento)
          : undefined,
        statusPagamento: novoStatusPagamento,
        valorPendente: novoValorPendente,
        dataUltimoPagamento: dto.valorPago ? new Date() : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.lancamentoFinanceiro.delete({ where: { id } });
    return { message: 'Lançamento removido com sucesso.' };
  }
}
