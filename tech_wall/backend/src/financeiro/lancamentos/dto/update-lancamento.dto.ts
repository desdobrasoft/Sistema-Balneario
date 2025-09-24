import { status_pagamento_venda } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateLancamentoDto {
  @IsOptional()
  @IsEnum(status_pagamento_venda)
  status_pagamento?: status_pagamento_venda;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor_pago?: number;

  @IsOptional()
  @IsDateString()
  data_vencimento?: string;
}
