import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EntregasController } from './entregas.controller';
import { EntregasService } from './entregas.service';

import { EntregasCronService } from './entregas-cron.service';

@Module({
  imports: [PrismaModule],
  controllers: [EntregasController],
  providers: [EntregasService, EntregasCronService],
  exports: [EntregasService], // Exporta o serviço para ser usado pelo módulo de Produção
})
export class EntregasModule {}
