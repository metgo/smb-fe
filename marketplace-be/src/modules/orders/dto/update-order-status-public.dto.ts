import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../orders.type';

export class UpdateOrderStatusPublicDto {
  @IsEnum(OrderStatus)
    status: OrderStatus;

  @IsOptional()
  @IsString()
    notes?: string;
}
