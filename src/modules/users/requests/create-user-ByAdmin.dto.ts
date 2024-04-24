import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserType } from '../users.type';
import { Locale } from 'src/common/enum';

export class createUserByAdminDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
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

  @IsEnum(UserType, { each: true })
  @ApiProperty({ enum: UserType })
  readonly role: UserType;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly dmoId: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [String], required: false })
  readonly businessesId: string[];

  @IsEnum(Locale)
  @IsOptional()
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: true,
  })
  readonly languagePreference: Locale;
}
