import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { GeoServicesTypes } from '../business.type';

export class GetAllBusinessesForGuestQuery extends CommonFilterQuery {
  @ApiProperty({
    type: String,
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    groupTypesId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    accessibilitiesId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    bussCategoriesId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    bussSubCategoriesId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'latitude of the location',
  })
  @IsOptional()
    lat: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'longituted of the location',
  })
  @IsOptional()
    long: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Miles for radius',
  })
  @IsOptional()
    miles: number;

  @ApiProperty({
    enum: GeoServicesTypes,
    required: false,
  })
  @IsEnum(GeoServicesTypes)
  @IsOptional()
    serviceType: GeoServicesTypes;
}
