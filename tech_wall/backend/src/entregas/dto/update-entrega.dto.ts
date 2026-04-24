import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusEntrega } from '../../generated/prisma/client';

export class UpdateEntregaDto {
  @IsOptional()
  @IsEnum(StatusEntrega)
  status?: StatusEntrega;

  @IsOptional()
  @IsString()
  transportadora?: string;

  @IsOptional()
  @IsDateString()
  previsaoEntrega?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
