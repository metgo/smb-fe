import { PartialType } from '@nestjs/mapped-types';
import {
  createMapPointCategoriesDto,
  createMapPointDto,
  createMapPointSubCategoriesDto,
  createMapPointSubCategoriesItemDto,
} from './createMapPoint.dto';

export class updateMapPointDto extends PartialType(createMapPointDto) { }
export class updateMapPointCategoriesDto extends PartialType(createMapPointCategoriesDto) { }
export class updateMapPointSubCategoriesDto extends PartialType(createMapPointSubCategoriesDto) { }
export class updateMapPointSubCategoriesItemDto extends PartialType(createMapPointSubCategoriesItemDto) { }
