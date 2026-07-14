import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AgendarColetaDto {
  @IsString()
  @IsNotEmpty()
  transportadora: string;

  @IsDateString()
  @IsNotEmpty()
  previsaoEntrega: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActionEntregaDto {
  @IsOptional()
  @IsString()
  notas?: string;
}
