import { IsInt, IsNumber, Min } from 'class-validator';

export class AplicarCorteDto {
  @IsInt()
  corteId: number;

  @IsNumber()
  @Min(0)
  origemX: number;

  @IsNumber()
  @Min(0)
  origemY: number;

  @IsInt()
  rotacao: number; // 0, 90, 180, 270
}
