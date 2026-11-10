import {
  IsEnum, IsNotEmpty, IsNumber, IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemType } from 'src/modules/orders/orders.type';

export class AddProductToCart {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    quantity: number;

  @ApiProperty({
    type: 'enum',
    enum: OrderItemType,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(OrderItemType)
    itemType: OrderItemType;
}
export class AddToCartDto {
  @IsNotEmpty()
  @ApiProperty({ type: AddProductToCart })
    product: AddProductToCart;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    campCode: string;
}
