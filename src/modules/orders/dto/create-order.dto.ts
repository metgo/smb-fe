import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
export class CreateOrderDto {
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
  @IsOptional()
  @ApiProperty()
    firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    lastName: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    type: [String],
    description: 'Array of BusinessId',
  })
    businessId: string[];
}
