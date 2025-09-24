import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTipoMaterialDto {
  @IsString()
  @IsNotEmpty()
  nome: string;
}
