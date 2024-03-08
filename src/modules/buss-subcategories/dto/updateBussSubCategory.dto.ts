import { PartialType } from '@nestjs/mapped-types';

import { createBussSubCategoryDto } from 'src/modules/buss-subcategories/dto/createBussSubCategory.dto';

export class updateBussSubCategoryDto extends PartialType(
  createBussSubCategoryDto,
) {}
