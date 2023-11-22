import { PartialType } from '@nestjs/mapped-types';
import { createBussSubCategoryDto } from './createBussSubCategory.dto';

export class updateBussSubCategoryDto extends PartialType(createBussSubCategoryDto) { }
