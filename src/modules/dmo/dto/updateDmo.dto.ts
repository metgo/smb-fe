import { PartialType } from '@nestjs/mapped-types';
import { CreateDMODto } from './createDmo.dto';

export class UpdateDMODto extends PartialType(CreateDMODto) {}
