import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlacasController } from './placas.controller';
import { PlacasService } from './placas.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlacasController],
  providers: [PlacasService],
})
export class PlacasModule {}
