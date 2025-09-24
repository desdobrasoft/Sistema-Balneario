import { Module } from '@nestjs/common';
import { EntregasModule } from 'src/entregas/entregas.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProducaoController } from './producao.controller';
import { ProducaoService } from './producao.service';

@Module({
  imports: [PrismaModule, EntregasModule],
  controllers: [ProducaoController],
  providers: [ProducaoService],
  exports: [ProducaoService],
})
export class ProducaoModule {}
