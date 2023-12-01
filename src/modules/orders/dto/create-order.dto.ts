import {
  ArrayMinSize,
  ArrayUnique,
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

  @IsNumber()
  @IsPositive()
  @ApiProperty()
    redeemedAmount: number;
}
export class CreateOrderDto {
  @IsNotEmpty()
  @ApiProperty()
    products: Product[];

  @ArrayMinSize(1, { message: 'At least one payment mode is required' })
  @ArrayUnique({ message: 'Payment mode must be unique' })
  @IsNotEmpty()
  @ApiProperty()
    paymentMode: PaymentMode[];

  @IsOptional()
  @ApiProperty()
    voucher: Voucher[];

  @IsNumber()
  @IsPositive({ message: 'Please add valid amount' })
  @IsNotEmpty()
  @ApiProperty()
    totalAmount: number;

  @IsNumber()
  @IsPositive({ message: 'Please add valid amount' })
  @IsNotEmpty()
  @ApiProperty()
    creditCardPayment: number;
}
