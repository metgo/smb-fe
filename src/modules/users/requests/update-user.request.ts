import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsOptional, IsPhoneNumber, IsString,
} from 'class-validator';

export class UpdateUserRequest {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly fullName: string;

  @IsPhoneNumber()
  @IsOptional()
  @ApiProperty()
  readonly phone: number;

  @IsEmail()
  @IsOptional()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly address: string;
}
