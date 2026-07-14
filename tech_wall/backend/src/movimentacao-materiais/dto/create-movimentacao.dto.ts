import {
  IsDateString,
  IsIn,
  IsNumber,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMovimentacaoDto {
  @IsInt()
  @IsNotEmpty()
  materiaPrimaId: number;

  @IsIn(['I', 'O'])
  tipoMovimentacao: 'I' | 'O';

  @IsDateString()
  dataMovimentacao: string;

  @IsNumber()
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
