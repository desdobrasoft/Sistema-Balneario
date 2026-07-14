import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StatusEntrega } from '../generated/prisma/client';

@Injectable()
export class EntregasCronService {
  private readonly logger = new Logger(EntregasCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkDelayedDeliveries() {
    this.logger.log('Iniciando verificação de entregas atrasadas...');
    const now = new Date();
    // Normalizar 'now' para considerar apenas a data (sem horas) se previsaoEntrega for apenas Data
    // Mas Date() direto com lt também funciona já que previsaoEntrega é às 00:00:00 UTC geralmente.
    // Vamos usar o now original para simplificar, se passou daquele dia já conta.
    now.setHours(0, 0, 0, 0);

    try {
      const entregasAtrasadas = await this.prisma.entrega.findMany({
        where: {
          status: StatusEntrega.EM_TRANSITO,
          previsaoEntrega: {
            lt: now, // menor que hoje = já passou
          },
        },
      });

      if (entregasAtrasadas.length === 0) {
        this.logger.log('Nenhuma entrega atrasada encontrada.');
        return;
      }

      this.logger.log(
        `Encontradas ${entregasAtrasadas.length} entregas atrasadas. Atualizando status...`,
      );

      for (const entrega of entregasAtrasadas) {
        await this.prisma.$transaction(async (tx) => {
          await tx.entrega.update({
            where: { id: entrega.id },
            data: { status: StatusEntrega.ATRASADA },
          });

          await tx.entregaHistorico.create({
            data: {
              entregaId: entrega.id,
              statusAnterior: entrega.status,
              statusNovo: StatusEntrega.ATRASADA,
              notas:
                'Atualizado automaticamente pelo sistema devido ao atraso na entrega.',
            },
          });
        });
      }

      this.logger.log('Atualização de entregas atrasadas concluída.');
    } catch (error) {
      this.logger.error('Erro ao verificar entregas atrasadas', error);
    }
  }
}
