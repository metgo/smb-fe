import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryMethod, OrderItemType } from 'src/modules/orders/orders.type';

class AddProductToCart {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    _id: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    quantity: number;

  @ApiProperty({
    type: 'enum',
    enum: OrderItemType,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(OrderItemType)
    itemType: OrderItemType;
}

class AddVendorPorductsToCart {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    _id: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    deliveryFee: number;

  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: DeliveryMethod,
    required: true,
  })
    deliveryMethod: DeliveryMethod;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    deliveryArea: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    deliveryPickupLocation: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    houseNo: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    apartment: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    city: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    street: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    additionalInfo: string;

  @ApiProperty({
    type: AddProductToCart,
    required: true,
  })
  @IsNotEmpty()
    products: AddProductToCart[];
}

export class AddVendorWiseProductsToCartDto {
  @IsNotEmpty()
  @ApiProperty({ type: AddVendorPorductsToCart })
    vendorProducts: AddVendorPorductsToCart[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    campCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    identifierId: string;
}
