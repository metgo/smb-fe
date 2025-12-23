import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { Purpose } from '../buss-subcategories.type';

export class GetAllSubCategoriesRequest extends LocaleFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    bussCategoryId: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    groupTypesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    accessibilitiesId: string[];

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    priceMin: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    priceMax: number;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    vendorDelivers: boolean;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({
    type: 'enum',
    enum: Purpose,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Purpose)
    purpose: Purpose;
}
