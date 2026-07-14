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

class RequisitoDto {
  @IsEnum(TipoRequisito)
  tipo: TipoRequisito;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsNotEmpty()
  parede: string;

  @IsInt()
  @IsNotEmpty()
  tipoPlacaId: number;

  @IsInt()
  @IsOptional()
  corteId?: number;
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
