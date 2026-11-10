import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/common/enum';

export class AssignVoucherDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    code: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
  })
  @IsOptional()
  @IsEnum(Locale)
    languagePreference: Locale;
}
