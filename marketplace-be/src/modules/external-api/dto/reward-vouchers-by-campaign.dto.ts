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

export class RewardVouchersByCampaignDto {
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
    campId: string;

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
