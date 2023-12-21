import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly code: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly token: string;
}
