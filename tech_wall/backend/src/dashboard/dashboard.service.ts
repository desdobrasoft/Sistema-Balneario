import { Injectable } from '@nestjs/common';
import { status_entrega } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAverageDeliveryTime() {
    const result = await this.prisma.$queryRaw<[{ avg_days: number | null }]>`
      SELECT AVG(EXTRACT(DAY FROM e.updated_at - v.data_venda)) as avg_days
      FROM entregas e
      JOIN vendas v ON e.venda_id = v.id
      WHERE e.status = ${status_entrega.ENTREGUE}::status_entrega;
    `;

    // Retorna a média de dias, arredondada para o inteiro mais próximo, ou 0 se não houver dados
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
      WHERE e.status = ${status_entrega.ENTREGUE}::status_entrega;
    `;

    const counts = result[0];

    // Converte BigInt para Number para serialização JSON
    return {
      early: Number(counts.early),
      onTime: Number(counts.onTime),
      slightlyLate: Number(counts.slightlyLate),
      late: Number(counts.late),
    };
  }
}
