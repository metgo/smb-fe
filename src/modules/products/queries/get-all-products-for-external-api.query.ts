import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { ExternalApiWithCampCodeFilterQuery } from 'src/common/query-handler/external-api-campcode.query';
import { ProductStatus } from 'src/modules/products/products.type';

export class GetAllProductsForExternalApiQuery extends ExternalApiWithCampCodeFilterQuery {
  @ApiProperty({ type: 'enum', enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
    status: ProductStatus;

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
