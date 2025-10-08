import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class GerenciarProducaoPlacaDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  adicionarAguardando?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  iniciarProducao?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  finalizarProducao?: number;
}
