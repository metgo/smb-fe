import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOtpToEmailDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly confirmPassword: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly token: string;
}
