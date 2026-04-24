import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TramasController } from './tramas.controller';
import { TramasService } from './tramas.service';

@Module({
  imports: [PrismaModule],
  controllers: [TramasController],
  providers: [TramasService],
})
export class TramasModule {}
