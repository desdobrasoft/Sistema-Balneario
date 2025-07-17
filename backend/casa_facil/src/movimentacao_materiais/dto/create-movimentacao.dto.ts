import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMovimentacaoDto {
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsIn(['I', 'O'])
  tipo_movimentacao: 'I' | 'O';

  @IsDateString()
  data_movimentacao: string;

  @IsInt()
  @IsPositive()
  qtde: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fornecedor?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
