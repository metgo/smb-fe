import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsOptional, IsString,
} from 'class-validator';
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
}
