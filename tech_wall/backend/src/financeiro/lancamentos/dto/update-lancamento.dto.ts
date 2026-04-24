import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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
  @Min(0)
  valorPago?: number;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;
}
