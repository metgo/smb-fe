import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { ProductStatus } from 'src/modules/products/products.type';

class images {
  image: string;

  caption: String;

  alt: String;
}

class Price {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    markedPrice: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
    discountAmount: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
    discountPercent: number;
}

class Quantity {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    initial: number;
}

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @IsOptional()
  @IsArray()
    images: images[];

  @ApiProperty()
  @IsNotEmpty()
    price: Price;

  @ApiProperty()
  @IsNotEmpty()
    quantity: Quantity;

  @IsEnum(ProductStatus)
  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: ProductStatus,
  })
    status: ProductStatus;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [String],
    description: 'Array of ObjectId',
  })
    categories: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [String],
    description: 'Array of ObjectId',
  })
    subCategories: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [String],
    description: 'Array of ObjectId',
  })
    features: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [String],
    description: 'Array of ObjectId',
  })
    collaboratorId: string[];
}
