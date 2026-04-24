import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { StatusProducaoPlaca } from '../../generated/prisma/client';

export class GerenciarProducaoPlacaDto {
  @IsEnum(StatusProducaoPlaca)
  status: StatusProducaoPlaca;

  @IsObject()
  @IsOptional()
  materiaisConsumidos?: Record<string, number>;
}
