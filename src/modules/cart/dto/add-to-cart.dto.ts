import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProductToCart {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    id: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    quantity: number;
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
