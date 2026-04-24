import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMateriaPrimaDto {
  @IsString()
  @IsNotEmpty()
  item: string;

  @IsInt()
  @IsOptional()
  quantidade?: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsInt()
  @IsOptional()
  estoqueMinimo?: number;
}
