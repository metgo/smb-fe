import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { ProductStatus } from 'src/modules/products/products.type';

export class GetAllProductStatsQuery {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
    startDate: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
    endDate: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    categoriesId: string[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    dmoId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    authorityId: string;

  @ApiProperty({
    type: 'enum',
    enum: ProductStatus,
    required: false,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
    status: ProductStatus;
}
