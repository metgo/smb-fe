import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';

export class GetAllSubCategoriesRequest extends LocaleFilterQuery {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
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
}
