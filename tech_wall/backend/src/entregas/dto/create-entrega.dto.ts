import { IsInt } from 'class-validator';

// Este DTO será usado internamente pelo sistema
export class CreateEntregaDto {
  @IsInt()
  vendaId: number;
}
