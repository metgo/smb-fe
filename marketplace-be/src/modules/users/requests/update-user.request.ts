import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsOptional, IsString,
} from 'class-validator';
import { Locale } from 'src/common/enum';
import { IsNotBlank } from 'src/core/decorators/is-not-blank.decorator';

export class UpdateUserRequest {
  @IsString()
  @IsOptional()
  @IsNotBlank()
  @ApiProperty()
  readonly firstName: string;

  @IsString()
  @IsOptional()
  @IsNotBlank()
  @ApiProperty()
  readonly lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly countryCode: string;

  @IsString()
  @IsOptional()
  @IsNotBlank()
  @ApiProperty()
  readonly phoneNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly dob: Date;

  @IsEmail()
  @IsOptional()
  @IsNotBlank()
  @ApiProperty()
  readonly email: string;

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
}
