import { PartialType } from '@nestjs/mapped-types';
import { createBussCategoryDto } from './createBussCategoryDto';

export class UpdateBussCategoryDto extends PartialType(createBussCategoryDto) {

}
