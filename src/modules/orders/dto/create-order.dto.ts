import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Locale } from 'src/common/enum';
import { DeliveryMethod } from 'src/modules/orders/orders.type';

class Voucher {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
    cartId: string;

  @IsOptional()
  @ApiProperty({ type: [Voucher] })
    voucher: Voucher[];

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
    email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    countryCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    lastName: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
  })
  @IsOptional()
  @IsEnum(Locale)
    languagePreference: Locale;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
    campCode: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(DeliveryMethod)
    deliveryMethod: DeliveryMethod;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    deliveryFee: number;
}
