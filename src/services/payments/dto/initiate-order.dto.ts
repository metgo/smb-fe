import {
  IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderPaymentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    orderId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    identifierId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    lowProfileId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    customerName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
    customerEmail: string;
}
