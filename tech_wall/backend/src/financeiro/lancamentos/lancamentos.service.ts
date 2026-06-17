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
        'venda.cliente.nome',
      ]);

      const statusMatches = Object.values(StatusPagamentoVenda).filter((s) =>
        s.toLowerCase().includes(searchValue.toLowerCase()),
      );
      if (statusMatches.length > 0) {
        if (!searchFilter.OR) searchFilter.OR = [];
        searchFilter.OR.push({ statusPagamento: { in: statusMatches } });
      }

      if (idsByValues.length > 0) {
        if (searchFilter.OR) {
          searchFilter.OR.push({ id: { in: idsByValues } });
        } else {
          searchFilter.OR = [{ id: { in: idsByValues } }];
        }
      }

      where = { ...baseWhere, ...searchFilter };
    }

    const orderBy =
      query.order?.length && query.columns?.length
        ? (query.order
            .map((o) => {
              const col = query.columns![o.column!];
              if (!col || !col.data) return undefined;
              const parts = col.data.split('.');
              if (parts.length === 1) return { [parts[0]]: o.dir };
              const res: any = {};
              let curr = res;
              for (let i = 0; i < parts.length - 1; i++) {
                curr[parts[i]] = {};
                curr = curr[parts[i]];
              }
              curr[parts[parts.length - 1]] = o.dir;
              return res;
            })
            .filter(Boolean) as any)
        : [{ dataVencimento: 'asc' }];

    const [data, total, filtered] = await Promise.all([
      this.prisma.lancamentoFinanceiro.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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

    if (novoValorPendente.greaterThan(lancamentoAtual.valorTotal)) {
      throw new BadRequestException(
        'O estorno não pode ser maior que o valor já pago.',
      );
    }

    // Lógica para atualizar o status automaticamente com base no pagamento
    let novoStatusPagamento =
      dto.statusPagamento ?? lancamentoAtual.statusPagamento;
    if (dto.valorPago !== undefined && dto.valorPago !== 0) {
      // Se um pagamento ou estorno foi feito
      if (novoValorPendente.isZero()) {
        novoStatusPagamento = StatusPagamentoVenda.PAGO;
      } else if (novoValorPendente.equals(lancamentoAtual.valorTotal)) {
        novoStatusPagamento = StatusPagamentoVenda.PENDENTE;
      } else {
        novoStatusPagamento = StatusPagamentoVenda.PAGO_PARCIALMENTE;
      }
    }

    const updated = await this.prisma.lancamentoFinanceiro.update({
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

    if (
      lancamentoAtual.vendaId &&
      novoStatusPagamento !== lancamentoAtual.statusPagamento
    ) {
      await this.prisma.venda.update({
        where: { id: lancamentoAtual.vendaId },
        data: { statusPagamento: novoStatusPagamento },
      });
    }

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.lancamentoFinanceiro.delete({ where: { id } });
    return { message: 'Lançamento removido com sucesso.' };
  }

  async getReportData(
    startDateStr?: string,
    endDateStr?: string,
    tipo?: string,
  ) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
    }
    if (endDateStr) {
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter =
      startDate || endDate
        ? {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        : undefined;

    const where: any = {};

    // As requested, the report should be based on dataUltimoPagamento to reflect what actually entered/left the account.
    if (dateFilter) {
      where.dataUltimoPagamento = dateFilter;
      // Also only include items that have been at least partially paid since it's based on payment date
      where.statusPagamento = { not: 'PENDENTE' };
    }

    if (tipo && tipo !== 'ALL') {
      where.tipo = tipo;
    }

    return this.prisma.lancamentoFinanceiro.findMany({
      where,
      orderBy: { dataUltimoPagamento: 'desc' },
      select: {
        id: true,
        tipo: true,
        descricao: true,
        valorTotal: true,
        valorPendente: true,
        statusPagamento: true,
        dataVencimento: true,
        dataUltimoPagamento: true,
        venda: { select: { cliente: { select: { nome: true } } } },
      },
    });
  }
}
