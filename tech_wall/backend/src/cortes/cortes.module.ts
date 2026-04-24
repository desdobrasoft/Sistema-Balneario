import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CortesController } from './cortes.controller';
import { CortesService } from './cortes.service';

@Module({
  imports: [PrismaModule],
  controllers: [CortesController],
  providers: [CortesService],
})
export class CortesModule {}
