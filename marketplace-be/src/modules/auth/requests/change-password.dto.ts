import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  readonly password: string;

  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  readonly confirmPassword: string;
}
