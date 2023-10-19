import { PartialType } from '@nestjs/swagger';
import { createMPSubCategoriesItemsDto } from './createSubCategoriesitems.dto';

export class updateMPSubCategoriesItemsDto extends PartialType(createMPSubCategoriesItemsDto) { }
