import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TiposPlacaController } from './tipos-placa.controller';
import { TiposPlacaService } from './tipos-placa.service';

@Module({
  imports: [PrismaModule],
  controllers: [TiposPlacaController],
  providers: [TiposPlacaService],
  exports: [TiposPlacaService],
})
export class TiposPlacaModule {}
