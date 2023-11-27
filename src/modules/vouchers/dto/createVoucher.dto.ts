import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail, IsNotEmpty, IsOptional, IsPositive, IsString,
} from 'class-validator';
import { AmountRange } from 'src/core/decorators/range.decorator';

export class createVoucherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    campCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @AmountRange(1, 5000, { message: 'Amount should be between 1 and 5000' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    noOfVoucher: number;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
    email: string;
}

export class createGuestVoucherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    campCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @AmountRange(1, 5000, { message: 'Amount should be between 1 and 5000' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    noOfVoucher: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
    email: string;
}
