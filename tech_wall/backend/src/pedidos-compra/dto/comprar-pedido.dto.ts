import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ComprarPedidoDto {
  @IsOptional()
  @IsString()
  fornecedor?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorUnitario?: number;
}
