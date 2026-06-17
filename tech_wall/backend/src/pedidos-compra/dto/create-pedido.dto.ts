import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreatePedidoDto {
  @IsInt()
  @IsNotEmpty()
  materiaPrimaId: number;

  @IsInt()
  @IsPositive()
  qtSolicitada: number;

  @IsOptional()
  @IsString()
  fornecedor?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorUnitario?: number;

  @IsOptional()
  @IsBoolean()
  isDirectPurchase?: boolean;
}
