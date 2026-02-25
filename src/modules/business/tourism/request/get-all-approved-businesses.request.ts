import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { SortOrder } from 'src/common/enum';
import { GeoServicesTypes } from '../../business.type';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';

export class GetAllApprovedBusinessesRequest extends LocaleFilterQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;

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

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    bussCategoriesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    bussSubCategoriesId: string[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    sortBy: string;

  @ApiProperty({
    enum: SortOrder,
    required: false,
  })
  @IsEnum(SortOrder)
  @IsOptional()
    sortOrder: SortOrder;

  @ApiProperty({
    enum: GeoServicesTypes,
    required: false,
  })
  @IsEnum(GeoServicesTypes)
  @IsOptional()
    serviceType: GeoServicesTypes;
}
