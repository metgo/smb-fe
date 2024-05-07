import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';
import { OrderStatus } from 'src/modules/orders/orders.type';

export class GetOrdersSummaryQuery extends PaginationFilterQuery {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    startDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    endDate: Date;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    dmoId: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    detailedView: string;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
    status: OrderStatus;
}
