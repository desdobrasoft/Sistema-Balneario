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
import { PrismaDatatableHelper } from '../../common/utils/datatable.helper';

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
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.lancamentoFinanceiro,
      prismaClient: this.prisma,
      query,
      searchableFields: ['descricao', 'venda.cliente.nome'],
      numericSearchFields: ['valorTotal', 'valorPendente', 'id', 'vendaId'],
      tableName: 'lancamentos_financeiros',
      defaultOrderBy: [{ dataVencimento: 'asc' }],
      include: { venda: { include: { cliente: true } } },
      customSearchEnhancer: (searchValue: string) => {
        const statusMatches = Object.values(StatusPagamentoVenda).filter((s) =>
          s.toLowerCase().includes(searchValue.toLowerCase()),
        );
        return statusMatches.length > 0
          ? [{ statusPagamento: { in: statusMatches } }]
          : [];
      },
      filterRequestedFields: false,
    });
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
        if (
          lancamentoAtual.statusPagamento ===
          StatusPagamentoVenda.ESTORNO_PENDENTE
        ) {
          novoStatusPagamento = StatusPagamentoVenda.CANCELADO;
        } else {
          novoStatusPagamento = StatusPagamentoVenda.PENDENTE;
        }
      } else {
        if (
          lancamentoAtual.statusPagamento ===
          StatusPagamentoVenda.ESTORNO_PENDENTE
        ) {
          novoStatusPagamento = StatusPagamentoVenda.ESTORNO_PENDENTE;
        } else {
          novoStatusPagamento = StatusPagamentoVenda.PAGO_PARCIALMENTE;
        }
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
