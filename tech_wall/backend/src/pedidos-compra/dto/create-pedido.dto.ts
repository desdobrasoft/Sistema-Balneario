import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePedidoDto {
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsInt()
  @IsPositive()
  qt_solicitada: number;

  @IsOptional()
  @IsString()
  fornecedor?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  valor_unitario?: number;
}
