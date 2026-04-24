import { IsInt, IsNotEmpty } from 'class-validator';

export class AlocacaoDto {
  @IsInt()
  @IsNotEmpty()
  requisitoId: number;

  @IsInt()
  @IsNotEmpty()
  placaId: number;
}
