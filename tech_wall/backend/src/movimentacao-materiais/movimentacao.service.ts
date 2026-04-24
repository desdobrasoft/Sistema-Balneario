import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { UpdateMovimentacaoDto } from './dto/update-movimentacao.dto';

@Injectable()
export class MovimentacaoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova movimentação e atualiza o estoque.
   */
  async create(dto: CreateMovimentacaoDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const { materiaPrimaId, tipoMovimentacao, qtde, ...rest } = dto;

      const stockUpdateOperation =
        tipoMovimentacao === 'I' ? { increment: qtde } : { decrement: qtde };

      // Se for saída, verifica se há estoque suficiente
      if (tipoMovimentacao === 'O') {
        const materiaPrima = await tx.materiaPrima.findUnique({
          where: { id: materiaPrimaId },
        });
        if (!materiaPrima || materiaPrima.quantidade < qtde) {
          throw new ConflictException('Estoque insuficiente para a saída.');
        }
      }

      // Atualiza o estoque
      await tx.materiaPrima.update({
        where: { id: materiaPrimaId },
        data: { quantidade: stockUpdateOperation },
      });

      // Cria o registro da movimentação
      return tx.movimentacaoMaterial.create({
        data: {
          ...rest,
          materiaPrimaId: materiaPrimaId,
          tipoMovimentacao,
          qtde,
          userId: userId,
          dataMovimentacao: new Date(dto.dataMovimentacao),
        },
      });
    });
  }

  /**
   * Remove uma movimentação e reverte a alteração no estoque.
   */
  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // Encontra a movimentação para saber o que reverter
      const movimentacao = await tx.movimentacaoMaterial.findUnique({
        where: { id },
      });

      if (!movimentacao) {
        throw new NotFoundException('Movimentação não encontrada.');
      }

      // Define a operação inversa para o estoque
      const stockRevertOperation =
        movimentacao.tipoMovimentacao === 'I' // Se foi entrada, a reversão é uma saída
          ? { decrement: movimentacao.qtde }
          : { increment: movimentacao.qtde };

      // Reverte a alteração no estoque
      await tx.materiaPrima.update({
        where: { id: movimentacao.materiaPrimaId },
        data: { quantidade: stockRevertOperation },
      });

      // Deleta o registro da movimentação
      await tx.movimentacaoMaterial.delete({ where: { id } });

      return { message: 'Movimentação removida com sucesso.' };
    });
  }

  /**
   * Atualiza uma movimentação, revertendo a antiga e aplicando a nova.
   */
  async update(id: number, dto: UpdateMovimentacaoDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // Pega os dados originais da movimentação
      const originalMov = await tx.movimentacaoMaterial.findUnique({
        where: { id },
      });
      if (!originalMov)
        throw new NotFoundException('Movimentação não encontrada.');

      // Reverte o efeito da movimentação original no estoque
      const stockRevertOp =
        originalMov.tipoMovimentacao === 'I'
          ? { decrement: originalMov.qtde }
          : { increment: originalMov.qtde };
      await tx.materiaPrima.update({
        where: { id: originalMov.materiaPrimaId },
        data: { quantidade: stockRevertOp },
      });

      // Prepara os novos dados e aplica o novo efeito no estoque
      const newQtde = dto.qtde ?? originalMov.qtde;
      const newTipo = dto.tipoMovimentacao ?? originalMov.tipoMovimentacao;
      const newMateriaPrimaId =
        dto.materiaPrimaId ?? originalMov.materiaPrimaId;

      const stockApplyOp =
        newTipo === 'I' ? { increment: newQtde } : { decrement: newQtde };

      // Checa estoque para a nova operação, se for saída
      if (newTipo === 'O') {
        const materiaPrima = await tx.materiaPrima.findUnique({
          where: { id: newMateriaPrimaId },
        });
        if (!materiaPrima || materiaPrima.quantidade < newQtde) {
          throw new ConflictException(
            'Estoque insuficiente para a nova movimentação.',
          );
        }
      }

      await tx.materiaPrima.update({
        where: { id: newMateriaPrimaId },
        data: { quantidade: stockApplyOp },
      });

      // Finalmente, atualiza o registro da movimentação
      return tx.movimentacaoMaterial.update({
        where: { id },
        data: {
          ...dto,
          materiaPrimaId: newMateriaPrimaId,
          qtde: newQtde,
          tipoMovimentacao: newTipo,
          userId: userId, // Registra quem fez a alteração
        },
      });
    });
  }

  findAll() {
    return this.prisma.movimentacaoMaterial.findMany({
      orderBy: { dataMovimentacao: 'desc' },
      include: {
        user: { select: { fullName: true } },
        materiaPrima: { select: { item: true } },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.movimentacaoMaterial.findUnique({
      where: { id },
      include: { user: true, materiaPrima: true },
    });
  }
}
