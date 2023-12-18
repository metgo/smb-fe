import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber, IsOptional, IsPositive, IsString,
} from 'class-validator';
import { ProductStatus } from '../products.type';

export class FilterQuery {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
      search: string;

    @ApiProperty({ type: Number, required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
      page: number;

    @ApiProperty({ type: Number, required: false })
    @IsNumber()
    @IsPositive()
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
