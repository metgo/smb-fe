import { PartialType } from '@nestjs/swagger';
import { createMPSubCategoriesItemsDto } from './createSubCategoriesItems.dto';

export class updateMPSubCategoriesItemsDto extends PartialType(createMPSubCategoriesItemsDto) { }
