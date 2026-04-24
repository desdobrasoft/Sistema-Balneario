import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateNotaFiscalDto {
  @IsString()
  @IsNotEmpty()
  nomeArquivo: string;

  @IsString()
  @IsNotEmpty()
  tipoArquivo: string;

  @IsString()
  @IsNotEmpty()
  arquivoBase64: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  lancamentoIds: number[];
}
