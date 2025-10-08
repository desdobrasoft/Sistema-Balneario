import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  status_pagamento_venda,
  status_producao,
  status_venda,
} from '@prisma/client';
import { ClientesService } from 'src/clientes/clientes.service';
import { EntregasService } from 'src/entregas/entregas.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInternalOrderDto } from './dto/create-internal-order.dto';
import { UpdateOrdemProducaoDto } from './dto/update-ordem-producao.dto';

const includeRelations = {
  vendas: {
    include: {
      clientes: true,
      modelo_casa: {
        include: {
          materiais_modelo_casa: {
            include: {
              materiais_estoque: true,
            },
          },
          placas_modelo_casa: {
            include: {
              placas: true,
            },
          },
        },
      },
    },
  },
  ordens_producao_historico: { orderBy: { data_alteracao: 'asc' } },
} as const;

@Injectable()
export class ProducaoService {
  constructor(
    private prisma: PrismaService,
    private entregasService: EntregasService,
    private clientesService: ClientesService,
  ) {}

  findAll() {
    return this.prisma.ordens_producao.findMany({
      orderBy: { created_at: 'desc' },
      include: includeRelations,
    });
  }

  async findOne(id: number, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    const ordem = await prisma.ordens_producao.findUnique({
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

  async createInternalOrder(dto: CreateInternalOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const internalClient =
        await this.clientesService.findOrCreateInternalClient();

      const modelo = await tx.modelo_casa.findUnique({
        where: { id: dto.modeloId },
      });

      if (!modelo) {
        throw new NotFoundException(
          `Modelo de casa com ID ${dto.modeloId} não encontrado.`,
        );
      }

      const internalVenda = await tx.vendas.create({
        data: {
          cliente_id: internalClient.id,
          modelo_id: modelo.id,
          data_venda: new Date(),
          preco: modelo.preco, // O preço pode ser zero ou o preço de custo
          endereco_entrega: 'Uso Interno',
          status: status_venda.PRODUCAO_AGENDADA, // Status direto
          status_pagamento: status_pagamento_venda.PAGO, // Já está "pago"
          is_internal: true,
        },
      });

      const novaOrdemProducao = await tx.ordens_producao.create({
        data: {
          venda_id: internalVenda.id,
          status: status_producao.MATERIAIS_PENDENTES, // Começa como pendente
        },
      });

      await tx.ordens_producao_historico.create({
        data: {
          ordem_producao_id: novaOrdemProducao.id,
          status_novo: novaOrdemProducao.status,
          notas: 'Ordem de produção interna.',
        },
      });

      return this.findOne(novaOrdemProducao.id, tx);
    });
  }

  async updateStatus(id: number, dto: UpdateOrdemProducaoDto) {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await this.findOne(id, tx);
      if (!ordem) {
        throw new NotFoundException(
          `Ordem de produção com ID ${id} não encontrada.`,
        );
      }
      if (ordem.status === dto.status) return ordem; // Nenhuma alteração necessária

      // Impede a alteração para PRONTO_PARA_ENVIO por este método
      if (dto.status === status_producao.PRONTO_PARA_ENVIO) {
        throw new ConflictException(
          'Utilize a ação "Finalizar Produção" para alterar o status para PRONTO_PARA_ENVIO.',
        );
      }

      // LÓGICA DE ALOCAÇÃO DE ESTOQUE
      if (
        ordem.status === status_producao.MATERIAIS_PENDENTES &&
        dto.status === status_producao.EM_ESPERA
      ) {
        if (!ordem.vendas.modelo_casa) {
          throw new ConflictException(
            `Não é possível alocar materiais pois a venda ou o modelo de casa associado não foram encontrados.`,
          );
        }

        const { materiais_modelo_casa, placas_modelo_casa } =
          ordem.vendas.modelo_casa;

        // 1. Validar estoque de materiais
        for (const item of materiais_modelo_casa) {
          if (item.materiais_estoque.quantidade < item.qt_modelo) {
            throw new ConflictException(
              `Estoque insuficiente para o material "${item.materiais_estoque.item}".`,
            );
          }
        }

        // 2. Validar estoque de placas
        for (const item of placas_modelo_casa) {
          if ((item.placas.qt_pronta ?? 0) < item.qt_placa) {
            throw new ConflictException(
              `Estoque insuficiente para a placa "${item.placas.nome}".`,
            );
          }
        }

        // 3. Debitar estoque de materiais
        for (const item of materiais_modelo_casa) {
          await tx.materiais_estoque.update({
            where: { id: item.material_id },
            data: { quantidade: { decrement: item.qt_modelo } },
          });
        }

        // 4. Debitar estoque de placas
        for (const item of placas_modelo_casa) {
          await tx.placas.update({
            where: { id: item.placa_id },
            data: { qt_pronta: { decrement: item.qt_placa } },
          });
        }
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

  async finalizarProducao(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await this.findOne(id, tx);
      if (!ordem) {
        throw new NotFoundException(
          `Ordem de produção com ID ${id} não encontrada.`,
        );
      }
      if (ordem.status === status_producao.PRONTO_PARA_ENVIO) {
        return ordem; // Ação idempotente
      }
      if (ordem.status === status_producao.MATERIAIS_PENDENTES) {
        throw new ConflictException(
          'A produção precisa ser iniciada antes de ser finalizada.',
        );
      }

      // LÓGICA DE INTEGRAÇÃO: Cria a entrega automaticamente
      if (!ordem.vendas) {
        throw new ConflictException(
          'Não é possível criar a entrega: a venda associada não foi encontrada.',
        );
      }

      const entregaExistente = await tx.entregas.findUnique({
        where: { venda_id: ordem.venda_id },
      });

      if (!entregaExistente) {
        await this.entregasService.create({
          venda_id: ordem.venda_id,
          endereco_entrega: ordem.vendas.endereco_entrega,
          previsao_entrega: new Date(
            new Date().setDate(new Date().getDate() + 7),
          ).toISOString(),
        });
      }

      const ordemAtualizada = await tx.ordens_producao.update({
        where: { id },
        data: { status: status_producao.PRONTO_PARA_ENVIO },
      });

      await tx.ordens_producao_historico.create({
        data: {
          ordem_producao_id: id,
          status_anterior: ordem.status,
          status_novo: status_producao.PRONTO_PARA_ENVIO,
          notas: 'Produção finalizada e pronta para envio.',
        },
      });

      return ordemAtualizada;
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Garante que a ordem existe
    return this.prisma.ordens_producao.delete({
      where: { id },
    });
  }
}
