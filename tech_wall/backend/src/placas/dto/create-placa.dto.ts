import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class MaterialPlacaDto {
  @IsInt()
  @IsNotEmpty()
  materiaPrimaId: number;

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

  @IsBoolean()
  @IsOptional()
  tramaEsquerdaAtiva?: boolean;

  @IsInt()
  @IsOptional()
  tramaEsquerdaId?: number;

  @IsString()
  @IsOptional()
  tramaEsquerdaOrientacao?: string;

  @IsBoolean()
  @IsOptional()
  tramaDireitaAtiva?: boolean;

  @IsInt()
  @IsOptional()
  tramaDireitaId?: number;

  @IsString()
  @IsOptional()
  tramaDireitaOrientacao?: string;

  @IsBoolean()
  @IsOptional()
  tramaSuperiorAtiva?: boolean;

  @IsInt()
  @IsOptional()
  tramaSuperiorId?: number;

  @IsString()
  @IsOptional()
  tramaSuperiorOrientacao?: string;

  @IsBoolean()
  @IsOptional()
  tramaInferiorAtiva?: boolean;

  @IsInt()
  @IsOptional()
  tramaInferiorId?: number;

  @IsString()
  @IsOptional()
  tramaInferiorOrientacao?: string;

  @IsBoolean()
  @IsOptional()
  retalhoDescartado?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MaterialPlacaDto)
  materiais: MaterialPlacaDto[];

  @IsBoolean()
  @IsOptional()
  darBaixaImediata?: boolean;
}
