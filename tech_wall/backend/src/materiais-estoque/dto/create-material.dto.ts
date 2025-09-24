import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class PlacaEspecificacaoDto {
  @IsNumber()
  @IsOptional()
  altura?: number;

  @IsNumber()
  @IsOptional()
  largura?: number;

  @IsNumber()
  @IsOptional()
  espessura?: number;

  @IsString()
  @IsOptional()
  tipo_trama?: string;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => PlacaEspecificacaoDto)
  placa_especificacao?: PlacaEspecificacaoDto;
}