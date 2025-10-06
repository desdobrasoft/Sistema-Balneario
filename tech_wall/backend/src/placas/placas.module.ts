import { Module } from '@nestjs/common';
import { PlacasService } from './placas.service';
import { PlacasController } from './placas.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlacasController],
  providers: [PlacasService],
})
export class PlacasModule {}
