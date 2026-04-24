import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class DataTableSearchDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  regex?: boolean;

  @IsOptional()
  fixed?: any;
}

export class DataTableOrderDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  column?: number;

  @IsOptional()
  @IsString()
  dir?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class DataTableColumnDto {
  @IsOptional()
  @IsString()
  data?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  searchable?: boolean;

  @IsOptional()
  @IsBoolean()
  orderable?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => DataTableSearchDto)
  search?: DataTableSearchDto;
}

export class DataTableParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  draw?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  start?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  length?: number = 10;

  @IsOptional()
  @ValidateNested()
  @Type(() => DataTableSearchDto)
  search?: DataTableSearchDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataTableOrderDto)
  order?: DataTableOrderDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataTableColumnDto)
  columns?: DataTableColumnDto[];
}

export interface DataTableResult<T> {
  draw: number;
  data: T[];
  recordsTotal: number;
  recordsFiltered: number;
}
