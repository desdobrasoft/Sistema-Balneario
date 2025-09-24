import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { status_pagamento_venda } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';

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

    return this.prisma.lancamentos_financeiros.create({
      data: {
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor_total: dto.valor_total,
        valor_pendente: dto.valor_total, // Inicialmente, nada foi pago
        data_vencimento: dto.data_vencimento
          ? new Date(dto.data_vencimento)
          : null,
        status_pagamento: status_pagamento_venda.PENDENTE,
        venda_id: dto.vendaId,
        movimentacao_material_id: dto.movimentacaoMaterialId,
      },
    });
  }

  findAll() {
    return this.prisma.lancamentos_financeiros.findMany({
      orderBy: { data_vencimento: 'asc' },
      include: {
        vendas: { include: { clientes: true } },
        // Inclua a relação de movimentação se precisar mostrar detalhes
      },
    });
  }

  async findOne(id: number) {
    const lancamento = await this.prisma.lancamentos_financeiros.findUnique({
      where: { id },
      include: { vendas: true, movimentacao_materiais: true },
    });
    if (!lancamento)
      throw new NotFoundException(`Lançamento com ID ${id} não encontrado.`);
    return lancamento;
  }

  async update(id: number, dto: UpdateLancamentoDto) {
    const lancamentoAtual = await this.findOne(id);

    const valorPagoNestaTransacao = dto.valor_pago ?? 0;
    const novoValorPendente = lancamentoAtual.valor_pendente.minus(
      valorPagoNestaTransacao,
    );

    if (novoValorPendente.isNegative()) {
      throw new BadRequestException(
        'O valor pago não pode ser maior que o valor pendente.',
      );
    }

    // Lógica para atualizar o status automaticamente com base no pagamento
    let novoStatusPagamento =
      dto.status_pagamento ?? lancamentoAtual.status_pagamento;
    if (dto.valor_pago) {
      // Se um pagamento foi feito
      if (novoValorPendente.isZero()) {
        novoStatusPagamento = status_pagamento_venda.PAGO;
      } else {
        novoStatusPagamento = status_pagamento_venda.PAGO_PARCIALMENTE;
      }
    }

    return this.prisma.lancamentos_financeiros.update({
      where: { id },
      data: {
        descricao: dto.descricao,
        data_vencimento: dto.data_vencimento
          ? new Date(dto.data_vencimento)
          : undefined,
        status_pagamento: novoStatusPagamento,
        valor_pendente: novoValorPendente,
        data_ultimo_pagamento: dto.valor_pago ? new Date() : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.lancamentos_financeiros.delete({ where: { id } });
    return { message: 'Lançamento removido com sucesso.' };
  }
}
