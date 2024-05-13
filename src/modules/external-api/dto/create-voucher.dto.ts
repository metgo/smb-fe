import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Locale } from 'src/common/enum';
import { AmountRange } from 'src/core/decorators/range.decorator';

export class CreateVoucherDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @AmountRange(1, 5000, { message: 'Amount should be between 1 and 5000' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    amount: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    noOfVoucher: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
  })
  @IsOptional()
  @IsEnum(Locale)
    languagePreference: Locale;
}
