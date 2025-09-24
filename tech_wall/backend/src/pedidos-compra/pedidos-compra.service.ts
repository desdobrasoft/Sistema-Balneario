import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { status_pedido_compra } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ReceberPedidoDto } from './dto/receber-pedido.dto';

@Injectable()
export class PedidosCompraService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePedidoDto, userId: number) {
    return this.prisma.pedidos_compra.create({
      data: {
        material_id: dto.materialId,
        user_id: userId,
        qt_solicitada: dto.qt_solicitada,
        fornecedor: dto.fornecedor,
        valor_unitario: dto.valor_unitario,
        status: 'SOLICITADO',
      },
    });
  }

  async findAll() {
    const pedidos = await this.prisma.pedidos_compra.findMany({
      include: {
        materiais_estoque: true,
        users: { select: { id: true, full_name: true } },
      },
    });

    // Lógica de ordenação customizada
    const statusOrder: Record<status_pedido_compra, number> = {
      ENTREGUE_COM_ALTERACAO: 1,
      RESOLVIDO: 2,
      ENTREGUE: 3,
      SOLICITADO: 4,
    };

    pedidos.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      if (!a.data_pedido && !b.data_pedido) return 0; // ambos são nulos
      if (!a.data_pedido) return 1; // 'a' nulo vai para o fim
      if (!b.data_pedido) return -1; // 'b' nulo vai para o fim

      // Se ambos não são nulos, compara as datas
      return b.data_pedido.getTime() - a.data_pedido.getTime();
    });

    return pedidos;
  }

  async receber(id: number, dto: ReceberPedidoDto) {
    if (dto.status === 'ENTREGUE_COM_ALTERACAO' && !dto.qt_entregue) {
      throw new BadRequestException(
        'A quantidade entregue é obrigatória para entregas com alteração.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidos_compra.findUnique({ where: { id } });
      if (!pedido)
        throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
      if (pedido.status !== 'SOLICITADO') {
        throw new ConflictException(
          'Este pedido não está mais aguardando recebimento.',
        );
      }

      const quantidadeRecebida =
        dto.status === 'ENTREGUE' ? pedido.qt_solicitada : dto.qt_entregue;

      // Atualiza o estoque do material
      await tx.materiais_estoque.update({
        where: { id: pedido.material_id },
        data: { quantidade: { increment: quantidadeRecebida } },
      });

      // Atualiza o pedido
      return tx.pedidos_compra.update({
        where: { id },
        data: {
          status: dto.status,
          qt_entregue: quantidadeRecebida,
        },
      });
    });
  }

  async resolver(id: number) {
    const pedido = await this.prisma.pedidos_compra.findUnique({
      where: { id },
    });
    if (!pedido)
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    if (pedido.status !== 'ENTREGUE_COM_ALTERACAO') {
      throw new ConflictException(
        'Apenas pedidos com entrega alterada podem ser resolvidos.',
      );
    }

    return this.prisma.pedidos_compra.update({
      where: { id },
      data: { status: 'RESOLVIDO' },
    });
  }
}
