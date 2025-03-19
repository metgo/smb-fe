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

export class createVoucherDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
    creatorName: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    creatorCountryCode: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
    creatorPhone: string;

  @ApiProperty({
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
    creatorEmail: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    message: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
    assigneeName: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    assigneeCountryCode: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    assigneePhone: string;

  @ApiProperty({
    required: false,
  })
  @IsEmail()
  @IsOptional()
    assigneeEmail: string;

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

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
  })
  @IsOptional()
  @IsEnum(Locale)
    languagePreference: Locale;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;
}
