import { status_pagamento_venda, status_venda } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateVendaDto {
  @IsOptional()
  @IsEnum(status_venda)
  status?: status_venda;

  @IsOptional()
  @IsEnum(status_pagamento_venda)
  status_pagamento?: status_pagamento_venda;
}
