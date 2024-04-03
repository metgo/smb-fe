import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { SortOrder } from 'src/common/enum';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { OrderStatus } from 'src/modules/orders/orders.type';

export class GetAllOrdersDetailsQuery extends CommonFilterQuery {
  @ApiProperty({ type: 'enum', enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
    status: OrderStatus;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    dmoId: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    sortBy: string;

  @ApiProperty({ enum: SortOrder, required: false })
  @IsEnum(SortOrder)
  @IsOptional()
    sortOrder: SortOrder;
}
