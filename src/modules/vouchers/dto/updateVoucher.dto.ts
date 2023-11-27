import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class updateVoucherDto { }

export class updateAssignedUserVoucherDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    code: string;
}
