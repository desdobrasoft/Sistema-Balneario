import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TipoRequisito } from '../../generated/prisma/client';

class VendaItemOverrideDto {
  @IsInt()
  @IsNotEmpty()
  materiaPrimaId: number;

  @IsInt()
  @IsPositive()
  qtFinal: number;
}

class VendaRequisitoOverrideDto {
  @IsNotEmpty()
  tipo: TipoRequisito;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsString()
  parede?: string;

  @IsNotEmpty()
  @IsInt()
  tipoPlacaId: number;

  @IsOptional()
  @IsInt()
  corteId?: number;
}

class VendaSuprimentoOverrideDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsString()
  @IsNotEmpty()
  unidade: string;

  @IsOptional()
  @IsString()
  momento?: string;
}

export class CreateVendaDto {
  @IsInt()
  @IsPositive()
  clienteId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  modeloId?: number;

  @IsDateString()
  @IsNotEmpty()
  dataVenda: string;

  @IsNumber()
  @IsPositive()
  preco: number;

  @IsString()
  @IsNotEmpty()
  enderecoEntrega: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendaItemOverrideDto)
  itensOverride?: VendaItemOverrideDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendaRequisitoOverrideDto)
  requisitosOverride?: VendaRequisitoOverrideDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendaSuprimentoOverrideDto)
  suprimentosOverride?: VendaSuprimentoOverrideDto[];
}
