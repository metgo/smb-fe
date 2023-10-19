import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString,
} from 'class-validator';
import { UserType } from '../users.type';

export class createUserByAdminDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly fullName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly email: string;

  @IsPhoneNumber()
  @IsOptional()
  @ApiProperty()
  readonly phone: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly address: string;

  @IsEnum(UserType, { each: true })
  @ApiProperty({ enum: UserType })
  readonly role: UserType;
}
