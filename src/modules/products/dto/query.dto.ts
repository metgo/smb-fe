import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsOptional, IsString,
} from 'class-validator';
import { ProductStatus } from '../products.type';

export class FilterQuery {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
      search: string;

    @ApiProperty({ type: Number, required: false })
    @IsOptional()
      page: number;

    @ApiProperty({ type: Number, required: false })
    @IsOptional()
      limit: number;

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
      businessId: string;

    @ApiProperty({ type: 'enum', enum: ProductStatus, required: false })
    @IsEnum(ProductStatus)
    @IsOptional()
      status: ProductStatus;
}
