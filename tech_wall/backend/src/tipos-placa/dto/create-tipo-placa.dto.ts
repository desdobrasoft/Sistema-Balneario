import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class MaterialTipoPlacaItemDto {
  @IsNumber()
  materiaPrimaId: number;

  @IsNumber()
  @Min(0)
  quantidade: number;
}

export class CreateTipoPlacaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  @Min(0)
  altura: number;

  @IsNumber()
  @Min(0)
  largura: number;

  @IsNumber()
  @Min(0)
  espessura: number;

  @IsString()
  @IsOptional()
  reforco?: string;

  @IsBoolean()
  @IsOptional()
  tramaEsquerdaAtiva?: boolean;

  @IsNumber()
  @IsOptional()
  tramaEsquerdaId?: number;

  @IsBoolean()
  @IsOptional()
  tramaDireitaAtiva?: boolean;

  @IsNumber()
  @IsOptional()
  tramaDireitaId?: number;

  @IsBoolean()
  @IsOptional()
  tramaSuperiorAtiva?: boolean;

  @IsNumber()
  @IsOptional()
  tramaSuperiorId?: number;

  @IsBoolean()
  @IsOptional()
  tramaInferiorAtiva?: boolean;

  @IsNumber()
  @IsOptional()
  tramaInferiorId?: number;

  @IsNumber()
  @IsOptional()
  estoqueMinimo?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MaterialTipoPlacaItemDto)
  materiais?: MaterialTipoPlacaItemDto[];
}
