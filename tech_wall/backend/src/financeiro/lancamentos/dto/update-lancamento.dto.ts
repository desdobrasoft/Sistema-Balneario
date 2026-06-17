import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusPagamentoVenda } from '../../../generated/prisma/client';

export class UpdateLancamentoDto {
  @IsOptional()
  @IsEnum(StatusPagamentoVenda)
  statusPagamento?: StatusPagamentoVenda;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  valorPago?: number;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;
}
