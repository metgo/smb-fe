import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryMethod } from 'src/modules/orders/orders.type';

export class UpdateCartDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    quantity: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    productId: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty()
    email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    countryCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    lastName: string;

  @IsEnum(DeliveryMethod)
  @IsOptional()
  @ApiProperty({
    type: 'enum',
    enum: DeliveryMethod,
    required: false,
  })
    deliveryMethod: DeliveryMethod;

  @IsString()
  @IsOptional()
  @ApiProperty()
    deliveryArea: string;

  @IsString()
  @IsOptional()
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
    additionalInfo: string;
}
