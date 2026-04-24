import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
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

export class CreateCorteDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VetorCorteDto)
  percurso: VetorCorteDto[];
}

export class UpdateCorteDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VetorCorteDto)
  percurso?: VetorCorteDto[];
}
