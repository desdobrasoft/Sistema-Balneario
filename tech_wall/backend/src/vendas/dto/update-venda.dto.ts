import { IsEnum, IsOptional } from 'class-validator';
import {
  StatusPagamentoVenda,
  StatusVenda,
} from '../../generated/prisma/client';

export class UpdateVendaDto {
  @IsOptional()
  @IsEnum(StatusVenda)
  status?: StatusVenda;

  @IsOptional()
  @IsEnum(StatusPagamentoVenda)
  statusPagamento?: StatusPagamentoVenda;

  @IsOptional()
  suprimentosObra?: any[];
}
