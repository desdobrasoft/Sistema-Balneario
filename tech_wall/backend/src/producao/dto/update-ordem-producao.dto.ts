import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusProducao } from '../../generated/prisma/client';

export class UpdateOrdemProducaoDto {
  @IsEnum(StatusProducao)
  status: StatusProducao;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsDateString()
  dataAgendamento?: string;
}
