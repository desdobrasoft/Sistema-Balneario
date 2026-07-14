import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePlacaDto {
  @IsString()
  @IsOptional()
  descricao?: string;

  @IsBoolean()
  @IsOptional()
  retalhoDescartado?: boolean;

  @IsNumber()
  @IsOptional()
  tipoPlacaId?: number;
}
