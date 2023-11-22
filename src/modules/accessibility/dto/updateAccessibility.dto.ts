import { PartialType } from '@nestjs/mapped-types';
import { createAccessibilityDto } from './createAccessibility.dto';

export class updateAccessibilityDto extends PartialType(createAccessibilityDto) { }
