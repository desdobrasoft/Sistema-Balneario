import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EntregasController } from './entregas.controller';
import { EntregasService } from './entregas.service';

@Module({
  imports: [PrismaModule],
  controllers: [EntregasController],
  providers: [EntregasService],
  exports: [EntregasService], // Exporta o serviço para ser usado pelo módulo de Produção
})
export class EntregasModule {}
