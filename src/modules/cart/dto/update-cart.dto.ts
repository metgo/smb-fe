import {
  IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    quantity: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    productId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    address: string;
}
