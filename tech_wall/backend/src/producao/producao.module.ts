import { Module } from '@nestjs/common';
import { ClientesModule } from '../clientes/clientes.module';
import { EntregasModule } from '../entregas/entregas.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProducaoController } from './producao.controller';
import { ProducaoService } from './producao.service';

@Module({
  imports: [PrismaModule, EntregasModule, ClientesModule],
  controllers: [ProducaoController],
  providers: [ProducaoService],
  exports: [ProducaoService],
})
export class ProducaoModule {}
