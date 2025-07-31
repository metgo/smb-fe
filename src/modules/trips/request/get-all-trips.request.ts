import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { SortOrder } from 'src/common/enum';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class GetAllTripsRequest extends CommonFilterQuery {
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

  @ApiProperty({
    enum: SortOrder,
    required: false,
  })
  @IsEnum(SortOrder)
  @IsOptional()
    sortOrder: SortOrder;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    sortBy: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    estimatedDurationMin: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    estimatedDurationMax: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    totalDistanceCoveredMin: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    totalDistanceCoveredMax: string;
}
