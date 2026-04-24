import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MateriaPrimaController } from './materia-prima.controller';
import { MateriaPrimaService } from './materia-prima.service';

@Module({
  imports: [PrismaModule],
  controllers: [MateriaPrimaController],
  providers: [MateriaPrimaService],
  exports: [MateriaPrimaService],
})
export class MateriaPrimaModule {}
