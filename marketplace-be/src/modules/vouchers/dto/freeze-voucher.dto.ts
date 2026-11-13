import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class Voucher {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
    amount: number;
}
export class FreezeVoucherDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    cartId: string;

  @IsNotEmpty()
  @ApiProperty({ type: [Voucher] })
    voucher: Voucher[];
}
