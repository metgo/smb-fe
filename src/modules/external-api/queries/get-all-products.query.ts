import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

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
}
