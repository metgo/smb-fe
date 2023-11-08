import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsOptional, IsString,
} from 'class-validator';

export class UpdateUserRequest {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly fullName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly countryCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly phoneNumber: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly address: string;
}
