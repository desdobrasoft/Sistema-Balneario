import { Module } from '@nestjs/common';
import { TiposMateriaisService } from './tipos-materiais.service';
import { TiposMateriaisController } from './tipos-materiais.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiposMateriaisController],
  providers: [TiposMateriaisService],
})
export class TiposMateriaisModule {}
