import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CreatePlacaDto } from './create-placa.dto';

export class CreatePlacaBatchDto extends CreatePlacaDto {
  @IsString()
  @IsOptional()
  prefixo?: string;

  @IsString()
  @IsOptional()
  sufixo?: string;

  @IsInt()
  @Min(1)
  valorInicial: number;

  @IsInt()
  @Min(1)
  quantidade: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  algarismos?: number;

  // O campo nome é herdado de CreatePlacaDto, mas será opcional no batch
  @IsString()
  @IsOptional()
  declare nome: string;
}
