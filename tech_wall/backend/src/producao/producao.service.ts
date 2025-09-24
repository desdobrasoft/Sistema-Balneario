import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, status_producao } from '@prisma/client';
import { EntregasService } from 'src/entregas/entregas.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrdemProducaoDto } from './dto/update-ordem-producao.dto';

const includeRelations = {
  vendas: { include: { clientes: true, modelo_casa: true } },
  ordens_producao_historico: { orderBy: { data_alteracao: 'asc' } },
} as const;

@Injectable()
export class ProducaoService {
  constructor(
    private prisma: PrismaService,
    private entregasService: EntregasService,
  ) {}

  findAll() {
    return this.prisma.ordens_producao.findMany({
      orderBy: { created_at: 'desc' },
      include: includeRelations,
    });
  }

  async findOne(id: number) {
    const ordem = await this.prisma.ordens_producao.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!ordem) {
      throw new NotFoundException(
        `Ordem de produção com ID ${id} não encontrada.`,
      );
    }
    return ordem;
  }

  async updateStatus(id: number, dto: UpdateOrdemProducaoDto) {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await tx.ordens_producao.findUnique({
        where: { id },
        include: {
          vendas: {
            include: {
              modelo_casa: { include: { materiais_modelo_casa: true } },
            },
          },
        },
      });
      if (!ordem)
        throw new NotFoundException(
          `Ordem de produção com ID ${id} não encontrada.`,
        );
      if (ordem.status === dto.status) return ordem; // Nenhuma alteração necessária

      // LÓGICA DE ALOCAÇÃO DE ESTOQUE
      if (dto.status === status_producao.PREPARANDO_MATERIAIS) {
        if (!ordem.vendas.modelo_casa) {
          throw new ConflictException(
            `Não é possível alocar materiais pois a venda ou o modelo de casa associado não foram encontrados.`,
          );
        }

        const materiais = ordem.vendas.modelo_casa.materiais_modelo_casa;
        for (const item of materiais) {
          const materialEstoque = await tx.materiais_estoque.findUnique({
            where: { id: item.material_id },
          });
          if (!materialEstoque || materialEstoque.quantidade < item.qt_modelo) {
            throw new ConflictException(
              `Estoque insuficiente para o material "${item.material_id}". Não é possível iniciar a preparação.`,
            );
          }
        }
        // Se chegou aqui, há estoque. Vamos debitar.
        for (const item of materiais) {
          await tx.materiais_estoque.update({
            where: { id: item.material_id },
            data: { quantidade: { decrement: item.qt_modelo } },
          });
        }
      }

      // LÓGICA DE INTEGRAÇÃO: Cria a entrega automaticamente
      if (dto.status === status_producao.PRONTO_PARA_ENVIO) {
        if (!ordem.vendas) {
          throw new ConflictException(
            'Não é possível criar a entrega: a venda associada não foi encontrada.',
          );
        }

        await this.entregasService.create({
          venda_id: ordem.venda_id,
          endereco_entrega: ordem.vendas.endereco_entrega,
          previsao_entrega: new Date(
            new Date().setDate(new Date().getDate() + 7),
          ).toISOString(),
        });
      }

      // Atualiza a ordem de produção
      const ordemAtualizada = await tx.ordens_producao.update({
        where: { id },
        data: {
          status: dto.status,
          data_agendamento: dto.data_agendamento
            ? new Date(dto.data_agendamento)
            : ordem.data_agendamento,
        },
      });

      // Adiciona o registro no histórico
      await tx.ordens_producao_historico.create({
        data: {
          ordem_producao_id: id,
          status_anterior: ordem.status,
          status_novo: dto.status,
          notas: dto.notas,
        },
      });

      return ordemAtualizada;
    });
  }
}
