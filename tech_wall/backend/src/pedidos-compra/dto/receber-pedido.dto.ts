import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

// Usaremos um enum local para validação
enum StatusRecebimento {
  ENTREGUE = 'ENTREGUE',
  ENTREGUE_COM_ALTERACAO = 'ENTREGUE_COM_ALTERACAO',
}

export class ReceberPedidoDto {
  @IsEnum(StatusRecebimento)
  status: StatusRecebimento;

  @IsOptional()
  @IsInt()
  @IsPositive()
  qt_entregue?: number;
}
