import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  item: string;

  @IsInt()
  @IsOptional()
  quantidade?: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsInt()
  @IsPositive()
  tipo_id: number;

  @IsInt()
  @IsOptional()
  lim_baixo_estoque?: number;
}