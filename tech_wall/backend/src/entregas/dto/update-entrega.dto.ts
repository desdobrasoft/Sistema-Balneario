import { status_entrega } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateEntregaDto {
  @IsOptional()
  @IsEnum(status_entrega)
  status?: status_entrega;

  @IsOptional()
  @IsString()
  transportadora?: string;

  @IsOptional()
  @IsDateString()
  previsao_entrega?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
