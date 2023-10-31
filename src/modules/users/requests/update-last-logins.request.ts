import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateLastLoginRequest {
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly lastLogin: Date;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly loginAttempts: number;
}
