import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

import { createVoucherDto } from './createVoucher.dto';

export class CreateVoucherBySuperadminDto extends createVoucherDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
    assigneeEmail: string;
}
