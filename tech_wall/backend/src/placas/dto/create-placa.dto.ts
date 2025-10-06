import { Type } from 'class-transformer';
import {
  IsArray,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class MaterialPlacaDto {
  @IsString()
  @IsNotEmpty()
  material_id: string;

  @IsInt()
  @IsPositive()
  quantidade: number;
}

export class CreatePlacaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialPlacaDto)
  materiais: MaterialPlacaDto[];
}
