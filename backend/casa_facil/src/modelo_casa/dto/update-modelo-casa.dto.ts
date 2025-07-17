import { PartialType } from '@nestjs/mapped-types';
import { CreateModeloCasaDto } from './create-modelo-casa.dto';

export class UpdateModeloCasaDto extends PartialType(CreateModeloCasaDto) {}
