import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

import { WebCreateBusiness } from './web-create-business.dto';

export class UpdateBusinessByAdminDto extends PartialType(WebCreateBusiness) {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    rejected_reason: string;
}
