import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Locale } from 'src/common/enum';

class Product {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;

  @IsNotEmpty()
  @ApiProperty()
    quantity: number;
}

class Voucher {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;
}
export class CreateOrderExternalApiDto {
  @IsNotEmpty()
  @ApiProperty({ type: [Product] })
    products: Product[];

  @IsOptional()
  @ApiProperty({ type: [Voucher] })
    voucher: Voucher[];

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
    email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    countryCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    lastName: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    type: [String],
    description: 'Array of BusinessId',
  })
    businessId: string[];

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
  })
  @IsOptional()
  @IsEnum(Locale)
    languagePreference: Locale;
}
