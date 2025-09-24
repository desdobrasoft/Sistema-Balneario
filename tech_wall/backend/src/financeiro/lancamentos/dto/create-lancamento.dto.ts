import { tipo_lancamento } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateLancamentoDto {
  @IsEnum(tipo_lancamento)
  tipo: tipo_lancamento;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @IsPositive()
  valor_total: number;

  @IsOptional()
  @IsDateString()
  data_vencimento?: string;

  // Referências mutuamente exclusivas (a lógica será validada no service)
  @IsOptional()
  @IsInt()
  vendaId?: number;

  @IsOptional()
  @IsInt()
  movimentacaoMaterialId?: number;
}
