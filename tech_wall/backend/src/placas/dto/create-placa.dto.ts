import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

class EconomiaItemDto {
  @IsInt()
  materiaPrimaId: number;

  @IsNumber()
  quantidade: number;
}

class EconomiaInfoDto {
  @IsEnum(['total', 'individual'])
  modo: 'total' | 'individual';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EconomiaItemDto)
  itens: EconomiaItemDto[];
}

export class CreatePlacaDto {
  @IsInt()
  tipoPlacaId: number;

  @IsInt()
  @Min(1)
  quantidade: number;

  @IsBoolean()
  @IsOptional()
  jaFinalizada?: boolean;

  @IsBoolean()
  @IsOptional()
  deduzirMateriaPrima?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => EconomiaInfoDto)
  economiaInfo?: EconomiaInfoDto;
}
