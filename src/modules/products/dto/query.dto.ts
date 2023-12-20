import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsOptional, IsString,
} from 'class-validator';
import { CommonFilterQuery } from 'src/common/utils/common-filter-query';
import { ProductStatus } from '../products.type';

export class FilterQuery extends CommonFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    businessId: string;

  @ApiProperty({ type: 'enum', enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
    status: ProductStatus;
}
