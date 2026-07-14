import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMateriaPrimaDto {
  @IsString()
  @IsNotEmpty()
  item: string;

  @IsNumber()
  @IsOptional()
  quantidade?: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsNumber()
  @IsOptional()
  estoqueMinimo?: number;
}
