import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PaymentMode } from 'src/modules/order/order.type';

class Voucher {
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

export class OrderDto {
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
}
