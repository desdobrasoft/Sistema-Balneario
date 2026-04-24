import { IsOptional, IsString } from 'class-validator';
import { DataTableParamsDto } from '../../common/dto/data-table.dto';

export class PlacaQueryDto extends DataTableParamsDto {
  @IsOptional()
  @IsString()
  availableForCut?: string;

  @IsOptional()
  @IsString()
  apenasFinais?: string;
}
