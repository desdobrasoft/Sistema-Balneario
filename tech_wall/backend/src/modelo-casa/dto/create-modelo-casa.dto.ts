import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class MaterialRequeridoDto {
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsInt()
  @IsPositive()
  qt_modelo: number;
}

class PlacaRequeridaDto {
  @IsInt()
  @IsPositive()
  placaId: number;

  @IsInt()
  @IsPositive()
  qt_placa: number;
}

export class CreateModeloCasaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsInt()
  @IsPositive()
  tempo_fabricacao: number;

  @IsUrl()
  @IsOptional()
  url_imagem?: string;

  @IsNumber()
  @IsPositive()
  preco: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequeridoDto)
  @IsOptional()
  materiais?: MaterialRequeridoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlacaRequeridaDto)
  @IsOptional()
  placas?: PlacaRequeridaDto[];
}
