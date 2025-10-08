import { IsInt, IsPositive } from 'class-validator';

export class BaixaProducaoPlacaDto {
  @IsInt()
  @IsPositive()
  quantidade: number;
}
