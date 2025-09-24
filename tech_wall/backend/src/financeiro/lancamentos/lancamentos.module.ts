import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LancamentosController } from './lancamentos.controller';
import { LancamentosService } from './lancamentos.service';

@Module({
  imports: [PrismaModule],
  controllers: [LancamentosController],
  providers: [LancamentosService],
  exports: [LancamentosService], // Exporta o serviço para ser usado em outros módulos
})
export class LancamentosModule {}
