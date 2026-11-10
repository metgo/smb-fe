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

class Id {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;
}

class Product {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    price: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    address: string;
}

export class StartCheckoutDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
    cartId: string;

  @IsNotEmpty()
  @ApiProperty({ type: [Product] })
    products: Product[];

  @IsOptional()
  @ApiProperty({ type: [Id] })
    voucher: Id[];

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
  @ApiProperty()
    identifierId: string;
}
