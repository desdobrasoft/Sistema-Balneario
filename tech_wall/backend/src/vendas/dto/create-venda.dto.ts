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

class VendaItemOverrideDto {
  @IsString()
  materialId: string;

  @IsInt()
  @IsPositive()
  qtFinal: number;
}

export class CreateVendaDto {
  @IsInt()
  @IsPositive()
  clienteId: number;

  @IsInt()
  @IsPositive()
  modeloId: number;

  @IsDateString()
  @IsNotEmpty()
  data_venda: string;

  @IsNumber()
  @IsPositive()
  preco: number;

  @IsString()
  @IsNotEmpty()
  endereco_entrega: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendaItemOverrideDto)
  itensOverride?: VendaItemOverrideDto[];
}