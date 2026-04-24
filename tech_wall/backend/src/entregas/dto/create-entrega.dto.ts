import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

// Este DTO será usado internamente pelo sistema
export class CreateEntregaDto {
  @IsInt()
  vendaId: number;

  @IsString()
  @IsNotEmpty()
  enderecoEntrega: string; // Supondo que o endereço virá dos dados do cliente na venda

  @IsDateString()
  previsaoEntrega: string;
}
