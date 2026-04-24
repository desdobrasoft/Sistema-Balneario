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
import { TipoLancamento } from '../../../generated/prisma/client';

export class CreateLancamentoDto {
  @IsEnum(TipoLancamento)
  tipo: TipoLancamento;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @IsPositive()
  valorTotal: number;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  // Referências mutuamente exclusivas (a lógica será validada no service)
  @IsOptional()
  @IsInt()
  vendaId?: number;

  @IsOptional()
  @IsInt()
  movimentacaoMaterialId?: number;
}
