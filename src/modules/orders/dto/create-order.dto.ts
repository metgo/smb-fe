import {
  ArrayMinSize,
  ArrayUnique,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PaymentMode } from 'src/modules/orders/orders.type';

export class CreateOrderDto {
  @ArrayMinSize(1, { message: 'At least one product is required' })
  @IsNotEmpty()
  @ApiProperty()
    productId: string[];

  @ArrayMinSize(1, { message: 'At least one payment mode is required' })
  @ArrayUnique({ message: 'Payment mode must be unique' })
  @IsNotEmpty()
  @ApiProperty()
    paymentMode: PaymentMode[];

  @IsOptional()
  @ArrayUnique({ message: 'Same voucher used multiple times' })
  @ApiProperty()
    voucher: string[];

  @IsNumber()
  @IsPositive({ message: 'Please add valid amount' })
  @IsNotEmpty()
  @ApiProperty()
    totalAmount: number;
}
