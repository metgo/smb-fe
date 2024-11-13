import { PartialType } from '@nestjs/mapped-types';
import { CreateProductByAdmin } from './create-product-by-admin.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductByAdminDto extends PartialType(CreateProductByAdmin) {
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
