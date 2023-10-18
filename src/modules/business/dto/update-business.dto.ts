import { PartialType } from '@nestjs/mapped-types';
import { createBusinessDto } from './business.dto';

export class updateBusinessDto extends PartialType(createBusinessDto) { }
