import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { OrderStatus } from 'src/modules/order/order.type';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: OrderStatus,
    required: true,
  })
    status: OrderStatus;
}
