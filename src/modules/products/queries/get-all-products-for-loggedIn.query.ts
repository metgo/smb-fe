import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ProductStatus } from 'src/modules/products/products.type';
import { GetAllProductsForNonLoggedInUserQuery } from 'src/modules/products/queries';

export class GetAllProductsForLoggedInUserQuery extends GetAllProductsForNonLoggedInUserQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    authorityId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    dmoId: string;

  @ApiProperty({ type: 'enum', enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
    status: ProductStatus;
}
