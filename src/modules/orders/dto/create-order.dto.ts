import {
  ArrayMinSize,
  ArrayUnique,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PaymentMode } from 'src/modules/orders/orders.type';

class Product {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;

  @IsNumber()
  @IsPositive()
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

  @ArrayMinSize(1, { message: 'At least one payment mode is required' })
  @ArrayUnique({ message: 'Payment mode must be unique' })
  @IsNotEmpty()
  @ApiProperty()
    paymentMode: PaymentMode[];

  @IsOptional()
  @ApiProperty({ type: [Voucher] })
    voucher: Voucher[];

  @IsNumber()
  @IsPositive({ message: 'Please add valid amount' })
  @IsOptional()
  @ApiProperty()
    creditCardPayment: number;

  @IsEmail()
  @IsOptional()
  @ApiProperty()
    email: string;
}
