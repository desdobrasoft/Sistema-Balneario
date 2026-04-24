import { Injectable } from '@nestjs/common';
import {
  StatusEntrega,
  StatusProducao,
  StatusVenda,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalSales,
      activeProds,
      vendasMensais,
      statusProducao,
      avgDelivery,
      deliveryAnalysis,
    ] = await Promise.all([
      // 1. Total de Vendas (não canceladas)
      this.prisma.venda.aggregate({
        _sum: { preco: true },
        where: { status: { not: StatusVenda.CANCELADA } },
      }),

      // 2. Produções Ativas
      this.prisma.ordemProducao.count({
        where: {
          status: {
            notIn: [StatusProducao.PRONTO_PARA_ENVIO, StatusProducao.CANCELADO],
          },
        },
      }),

      // 3. Vendas por Mês (últimos 6 meses)
      this.prisma.venda.findMany({
        where: {
          dataVenda: { gte: sixMonthsAgo },
          status: { not: StatusVenda.CANCELADA },
        },
        select: {
          dataVenda: true,
          preco: true,
        },
      }),

      // 4. Status de Produção (Agrupado)
      this.prisma.ordemProducao.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // 5. Média de Entrega (Existente)
      this.getAverageDeliveryTime(),

      // 6. Análise de Entrega (Existente)
      this.getDeliveryTimeAnalysis(),
    ]);

    // Processar vendas mensais
    const salesByMonthMap: Record<string, number> = {};
    vendasMensais.forEach((v) => {
      const date = new Date(v.dataVenda);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      salesByMonthMap[monthKey] =
        (salesByMonthMap[monthKey] || 0) + Number(v.preco);
    });

    const monthlySales = Object.entries(salesByMonthMap)
      .map(([month, sales]) => ({ month, sales }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalSalesValue: Number(totalSales._sum.preco || 0),
      activeProdsCount: activeProds,
      avgDeliveryTime: `${avgDelivery.avgDays || 0} Dias`,
      monthlySales,
      productionStatus: statusProducao.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      deliveryAnalysis,
    };
  }

  async getAverageDeliveryTime() {
    const result = await this.prisma.$queryRaw<[{ avg_days: number | null }]>`
      SELECT AVG(EXTRACT(DAY FROM e.updated_at - v.data_venda)) as avg_days
      FROM entregas e
      JOIN vendas v ON e.venda_id = v.id
      WHERE e.status = ${StatusEntrega.ENTREGUE}::status_entrega;
    `;

    return {
      avgDays: Math.round(result[0]?.avg_days ?? 0),
    };
  }

  async getDeliveryTimeAnalysis() {
    const result = await this.prisma.$queryRaw<
      [
        {
          early: bigint;
          onTime: bigint;
          slightlyLate: bigint;
          late: bigint;
        },
      ]
    >`
      SELECT
        COUNT(*) FILTER (WHERE (e.updated_at - v.data_venda) < 0.75 * (e.previsao_entrega - v.data_venda)) AS early,
        COUNT(*) FILTER (WHERE (e.updated_at - v.data_venda) >= 0.75 * (e.previsao_entrega - v.data_venda) AND e.updated_at <= e.previsao_entrega) AS "onTime",
        COUNT(*) FILTER (WHERE e.updated_at > e.previsao_entrega AND (e.updated_at - e.previsao_entrega) <= interval '5 days') AS "slightlyLate",
        COUNT(*) FILTER (WHERE (e.updated_at - e.previsao_entrega) > interval '5 days') AS late
      FROM entregas e
      JOIN vendas v ON e.venda_id = v.id
      WHERE e.status = ${StatusEntrega.ENTREGUE}::status_entrega;
    `;

    const counts = result[0];

    return {
      early: Number(counts.early),
      onTime: Number(counts.onTime),
      slightlyLate: Number(counts.slightlyLate),
      late: Number(counts.late),
    };
  }
}
