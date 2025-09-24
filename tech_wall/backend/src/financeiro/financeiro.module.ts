import { Module } from '@nestjs/common';
import { LancamentosModule } from './lancamentos/lancamentos.module';

@Module({
  imports: [LancamentosModule], // Importa o submódulo de lançamentos
})
export class FinanceiroModule {}
