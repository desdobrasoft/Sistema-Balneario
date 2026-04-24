import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum DirecaoCorte {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export class VetorCorteDto {
  @IsEnum(DirecaoCorte)
  direcao: DirecaoCorte;

  @IsNumber()
  @Min(0.1)
  distancia: number;
}

export class RealizarCorteDto {
  @IsString()
  @IsOptional()
  nome?: string; // Nome opcional, se não enviado atualiza a original

  @IsNumber()
  @IsOptional()
  vincularParaPlacaId?: number; // Se enviado, cria nova instância deste modelo

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VetorCorteDto)
  percurso: VetorCorteDto[];

  @IsNumber()
  @Min(0)
  origemX: number; // Geralmente 0 para iniciar no inferior esquerdo

  @IsNumber()
  @Min(0)
  origemY: number; // Geralmente a altura total da placa
}
