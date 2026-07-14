import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoPlacaDto } from './create-tipo-placa.dto';

export class UpdateTipoPlacaDto extends PartialType(CreateTipoPlacaDto) {}
