import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  id: string; // O ID é texto e deve ser fornecido na criação

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  qt_estoque?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lim_baixo_estoque?: number;
}
