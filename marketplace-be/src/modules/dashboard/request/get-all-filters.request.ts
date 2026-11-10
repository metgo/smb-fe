import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ServicesTypes } from '../dashboard.type';

export class GetAllFiltersRequest {
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
    categoriesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    subCategoriesId: string[];

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
    groupTypesId: string[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    topic: string;

  @ApiProperty({
    isArray: true,
    required: false,
    enum: ServicesTypes,
  })
  @IsOptional()
  @IsEnum(ServicesTypes, { each: true })
    serviceType?: ServicesTypes[];

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;
}
