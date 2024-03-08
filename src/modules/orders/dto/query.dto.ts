import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/modules/orders/orders.type';

export class FilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    page: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    limit: number;

  @ApiProperty({ type: 'enum', enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
    status: OrderStatus;
}
