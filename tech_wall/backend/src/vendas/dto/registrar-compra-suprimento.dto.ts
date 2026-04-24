import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class RegistrarCompraSuprimentoDto {
  @IsString()
  @IsNotEmpty()
  suprimentoId: string;

  @IsNumber()
  @IsPositive()
  precoPago: number;
}
