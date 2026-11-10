import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Locale } from 'src/common/enum';

export class RegisterStep2Request {
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  readonly password: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly phoneNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly countryCode: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Locale)
  readonly languagePreference: Locale;
}
