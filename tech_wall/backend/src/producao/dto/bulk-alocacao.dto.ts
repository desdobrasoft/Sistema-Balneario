import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';

class BulkAlocacaoItemDto {
  @IsInt()
  requisitoId: number;

  @IsInt()
  @IsOptional()
  placaId?: number;
}

export class BulkAlocacaoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAlocacaoItemDto)
  itens: BulkAlocacaoItemDto[];
}
