import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PaymentMode } from 'src/modules/orders/orders.type';

export class Voucher {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    redeemedAmount: number;
}

class Mode {
  @IsEnum(PaymentMode)
  @IsNotEmpty()
  @ApiProperty()
    mode: PaymentMode;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    productId: string;

  @IsNotEmpty()
  @ApiProperty()
    payment: Mode[];

  @IsOptional()
  @ApiProperty()
    voucher: Voucher[];

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty()
    totalAmount: number;
}
