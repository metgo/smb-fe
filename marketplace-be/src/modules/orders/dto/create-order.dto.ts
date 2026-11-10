import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Locale } from 'src/common/enum';

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
  @IsNotEmpty()
  @ApiProperty()
    firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    address: string;

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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
    identifierId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Client-generated session id used to hold Lion Coin reservations made in the cart drawer before this order existed.',
  })
    lionCoinSessionId: string;
}
