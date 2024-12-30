import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsNotBlank } from 'src/core/decorators/is-not-blank.decorator';
import { ToBoolean } from 'src/core/decorators/to-boolean.decorator';
import { DeliveryArea } from 'src/modules/business/dto';
import { ProductStatus } from 'src/modules/products/products.type';

class Price {
  @IsNumber()
  @IsNotEmpty()
  @IsNotBlank()
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
  @IsOptional()
  @ApiProperty()
    initial: number;

  @IsOptional()
  @ApiProperty()
  @ToBoolean()
    isUnlimited: boolean;
}

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    description: string;

  @ApiProperty()
  @IsNotEmpty()
    price: Price;

  @ApiProperty()
  @IsNotEmpty()
    quantity: Quantity;

  @IsEnum(ProductStatus)
  @IsOptional()
  @IsNotBlank()
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

  @ApiProperty({
    required: false,
    type: [DeliveryArea],
  })
  @IsOptional()
  @IsArray()
    deliveryArea: DeliveryArea[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    deliverySpecificSellerInfo: string[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    deliveryReturnExchange: string[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    deliveryAdditionalInfo: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @ToBoolean()
    isPickUpAvailable: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @ToBoolean()
    deliveryInfoSameAsBusiness: boolean;

  @IsOptional()
  @ApiProperty()
    activeStartDate: Date;

  @IsOptional()
  @ApiProperty()
    activeEndDate: Date;
}
