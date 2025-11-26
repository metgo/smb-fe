import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddProductToCart } from './add-to-cart.dto';

export class AddItemsToCartDto {
  @IsNotEmpty()
  @ApiProperty({ type: [AddProductToCart] })
    products: AddProductToCart[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    campCode: string;
}
