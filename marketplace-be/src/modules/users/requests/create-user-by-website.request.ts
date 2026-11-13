import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/common/enum';

export class CreateUserByWebsiteRequest {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly countryCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly phoneNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly address: string;

  @IsEnum(Locale)
  @IsOptional()
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: true,
  })
  readonly languagePreference: Locale;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  readonly siteName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  readonly businessName?: string;
}
