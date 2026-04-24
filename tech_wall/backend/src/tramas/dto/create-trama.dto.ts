import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTramaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  @Min(0)
  alturaBase: number;

  @IsNumber()
  @Min(0)
  profundidadeSaliencia: number;

  @IsBoolean()
  @IsOptional()
  iniciaComSaliencia?: boolean;

  @IsString()
  @IsOptional()
  direcionamento?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  cortes: number[];
}
