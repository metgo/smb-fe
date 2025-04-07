import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { OrderStatus } from 'src/modules/orders/orders.type';

export class GetAllOrdersRequest extends CommonFilterQuery {
  @ApiProperty({ type: 'enum', enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
    status: OrderStatus;
}
