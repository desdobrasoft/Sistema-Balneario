import { status_producao } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrdemProducaoDto {
  @IsEnum(status_producao)
  status: status_producao;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsDateString()
  data_agendamento?: string;
}
