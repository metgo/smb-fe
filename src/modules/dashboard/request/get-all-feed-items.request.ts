import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { SortOrder } from 'src/common/enum';
import { ServicesTypes } from '../dashboard.type';

export class GetAllFeedItemsRequest extends CommonFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    identifierId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
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
    categoriesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    subCategoriesId: string[];

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
    isArray: true,
    required: false,
    enum: ServicesTypes,
  })
  @IsOptional()
  @IsEnum(ServicesTypes, { each: true })
    serviceType?: ServicesTypes[];
}
