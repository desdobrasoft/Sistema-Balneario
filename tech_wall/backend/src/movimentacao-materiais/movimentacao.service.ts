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
      const { materialId, tipo_movimentacao, qtde, ...rest } = dto;

      const stockUpdateOperation =
        tipo_movimentacao === 'I' ? { increment: qtde } : { decrement: qtde };

      // Se for saída, verifica se há estoque suficiente
      if (tipo_movimentacao === 'O') {
        const material = await tx.materiais_estoque.findUnique({
          where: { id: materialId },
        });
        if (!material || material.quantidade < qtde) {
          throw new ConflictException('Estoque insuficiente para a saída.');
        }
      }

      // Atualiza o estoque
      await tx.materiais_estoque.update({
        where: { id: materialId },
        data: { quantidade: stockUpdateOperation },
      });

      // Cria o registro da movimentação
      return tx.movimentacao_materiais.create({
        data: {
          ...rest,
          material_id: materialId,
          tipo_movimentacao,
          qtde,
          user_id: userId,
          data_movimentacao: new Date(dto.data_movimentacao),
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
      const movimentacao = await tx.movimentacao_materiais.findUnique({
        where: { id },
      });

      if (!movimentacao) {
        throw new NotFoundException('Movimentação não encontrada.');
      }

      // Define a operação inversa para o estoque
      const stockRevertOperation =
        movimentacao.tipo_movimentacao === 'I' // Se foi entrada, a reversão é uma saída
          ? { decrement: movimentacao.qtde }
          : { increment: movimentacao.qtde };

      // Reverte a alteração no estoque
      await tx.materiais_estoque.update({
        where: { id: movimentacao.material_id },
        data: { quantidade: stockRevertOperation },
      });

      // Deleta o registro da movimentação
      await tx.movimentacao_materiais.delete({ where: { id } });

      return { message: 'Movimentação removida com sucesso.' };
    });
  }

  /**
   * Atualiza uma movimentação, revertendo a antiga e aplicando a nova.
   */
  async update(id: number, dto: UpdateMovimentacaoDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // Pega os dados originais da movimentação
      const originalMov = await tx.movimentacao_materiais.findUnique({
        where: { id },
      });
      if (!originalMov)
        throw new NotFoundException('Movimentação não encontrada.');

      // Reverte o efeito da movimentação original no estoque
      const stockRevertOp =
        originalMov.tipo_movimentacao === 'I'
          ? { decrement: originalMov.qtde }
          : { increment: originalMov.qtde };
      await tx.materiais_estoque.update({
        where: { id: originalMov.material_id },
        data: { quantidade: stockRevertOp },
      });

      // Prepara os novos dados e aplica o novo efeito no estoque
      const newQtde = dto.qtde ?? originalMov.qtde;
      const newTipo = dto.tipo_movimentacao ?? originalMov.tipo_movimentacao;
      const newMaterialId = dto.materialId ?? originalMov.material_id;

      const stockApplyOp =
        newTipo === 'I' ? { increment: newQtde } : { decrement: newQtde };

      // Checa estoque para a nova operação, se for saída
      if (newTipo === 'O') {
        const material = await tx.materiais_estoque.findUnique({
          where: { id: newMaterialId },
        });
        if (!material || material.quantidade < newQtde) {
          throw new ConflictException(
            'Estoque insuficiente para a nova movimentação.',
          );
        }
      }

      await tx.materiais_estoque.update({
        where: { id: newMaterialId },
        data: { quantidade: stockApplyOp },
      });

      // Finalmente, atualiza o registro da movimentação
      return tx.movimentacao_materiais.update({
        where: { id },
        data: {
          ...dto,
          material_id: newMaterialId,
          qtde: newQtde,
          tipo_movimentacao: newTipo,
          user_id: userId, // Registra quem fez a alteração
        },
      });
    });
  }

  findAll() {
    return this.prisma.movimentacao_materiais.findMany({
      orderBy: { data_movimentacao: 'desc' },
      include: {
        users: { select: { full_name: true } },
        materiais_estoque: { select: { item: true } },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.movimentacao_materiais.findUnique({
      where: { id },
      include: { users: true, materiais_estoque: true },
    });
  }
}
