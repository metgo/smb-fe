import { PartialType } from '@nestjs/mapped-types';
import { ProductDto } from './product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(ProductDto) {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
    updatedPrimaryImageIndex: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    updatedPrimaryImageURL: string;
}
