import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { OrderStatus } from 'src/modules/orders/orders.type';

export class GetOrdersSummaryQuery extends CommonFilterQuery {
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
