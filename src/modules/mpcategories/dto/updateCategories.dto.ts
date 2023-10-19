import { PartialType } from '@nestjs/mapped-types';
import { createMPCategoriesDto } from './createCategories.dto';

export class updateMPCategoriesDto extends PartialType(createMPCategoriesDto) { }
