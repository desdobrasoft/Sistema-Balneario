import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class MaterialRequeridoDto {
  @IsInt()
  @IsNotEmpty()
  materiaPrimaId: number;

  @IsInt()
  @IsPositive()
  qtModelo: number;
}

enum TipoRequisito {
  PLACA_LISA = 'PLACA_LISA',
  CORTE_ESPECIFICO = 'CORTE_ESPECIFICO',
}

enum ReforcoPlaca {
  UM_P = 'UM_P',
  DOIS_P = 'DOIS_P',
  S_P = 'S_P',
}

class RequisitoDto {
  @IsEnum(TipoRequisito)
  tipo: TipoRequisito;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsNotEmpty()
  parede: string;

  // Campos para PLACA_LISA
  @IsNumber()
  @IsOptional()
  largura?: number;

  @IsNumber()
  @IsOptional()
  altura?: number;

  @IsNumber()
  @IsOptional()
  espessura?: number;

  @IsInt()
  @IsOptional()
  tramaEsquerdaId?: number;

  @IsInt()
  @IsOptional()
  tramaDireitaId?: number;

  @IsInt()
  @IsOptional()
  tramaSuperiorId?: number;

  @IsInt()
  @IsOptional()
  tramaInferiorId?: number;

  // Campos para CORTE_ESPECIFICO
  @IsInt()
  @IsOptional()
  corteId?: number;

  @IsEnum(ReforcoPlaca)
  @IsOptional()
  reforco?: ReforcoPlaca;
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
  tempoFabricacao: number;

  @IsString()
  @IsOptional()
  imagemBase64?: string;

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
  @Type(() => RequisitoDto)
  @IsOptional()
  requisitos?: RequisitoDto[];

  @IsArray()
  @IsOptional()
  suprimentosObra?: any[];
}
