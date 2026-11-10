import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OTPPurpose } from 'src/modules/users/users.type';

export class EmailDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;
}
export class SendOtpToEmailDTO extends EmailDTO {
  @IsEnum(OTPPurpose)
  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: OTPPurpose,
    required: true,
  })
  readonly purpose: OTPPurpose;
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
