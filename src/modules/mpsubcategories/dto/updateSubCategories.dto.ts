import { PartialType } from '@nestjs/mapped-types';
import { createMPSubCategoriesDto } from './createSubCategories.dto';

export class updateMPSubCategoriesDto extends PartialType(createMPSubCategoriesDto) { }
