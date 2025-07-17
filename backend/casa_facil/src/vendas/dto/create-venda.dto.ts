import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

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
}
