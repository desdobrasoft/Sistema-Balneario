import { PartialType } from '@nestjs/mapped-types';
import { CreatePlacaDto } from './create-placa.dto';

import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlacaDto extends PartialType(CreatePlacaDto) {
  @IsBoolean()
  @IsOptional()
  ajustarEstoqueConsumido?: boolean;
}
