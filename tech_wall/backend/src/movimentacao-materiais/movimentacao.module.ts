import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MovimentacaoController } from './movimentacao.controller';
import { MovimentacaoService } from './movimentacao.service';

@Module({
  imports: [PrismaModule], // Importa o PrismaModule para o serviço poder usar o Prisma Client
  controllers: [MovimentacaoController],
  providers: [MovimentacaoService],
})
export class MovimentacaoModule {}
