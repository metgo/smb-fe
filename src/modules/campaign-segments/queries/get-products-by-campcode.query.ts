import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { GetByCampCodeQuery } from 'src/modules/campaign-segments/queries/get-by-campcode.query';
import { ProductStatus } from 'src/modules/products/products.type';

export class GetProductsByCampCodeQuery extends GetByCampCodeQuery {
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
