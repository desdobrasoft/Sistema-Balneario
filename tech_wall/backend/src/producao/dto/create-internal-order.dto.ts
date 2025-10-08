import { IsInt, IsPositive } from 'class-validator';

export class CreateInternalOrderDto {
  @IsInt()
  @IsPositive()
  modeloId: number;
}
