import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './create-material.dto';

// Permite a atualização de todos os campos, exceto o ID
export class UpdateMaterialDto extends PartialType(
  OmitType(CreateMaterialDto, ['id'] as const),
) {}
