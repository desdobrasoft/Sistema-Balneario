import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

// Este DTO será usado internamente pelo sistema
export class CreateEntregaDto {
  @IsInt()
  venda_id: number;

  @IsString()
  @IsNotEmpty()
  endereco_entrega: string; // Supondo que o endereço virá dos dados do cliente na venda

  @IsDateString()
  previsao_entrega: string;
}
