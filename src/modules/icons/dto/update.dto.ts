import { PartialType } from '@nestjs/mapped-types';
import { CreateIconDto } from './create.dto';

export class UpdateIconDto extends PartialType(CreateIconDto) {}
