import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { ExternalApiWithCampCodeFilterQuery } from 'src/modules/external-api/queries/external-api-campcode.query';

export class GetAllProductsQuery extends ExternalApiWithCampCodeFilterQuery {
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

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    authorityId: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    priceMin: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    priceMax: number;
}
