import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { BusinessStatus } from 'src/modules/business/business.type';

export class UpdateBusinessByAdminDto {
    @ApiProperty({
      type: 'enum',
      enum: BusinessStatus,
      required: true,
    })
    @IsNotEmpty()
    @IsEnum(BusinessStatus)
      status: BusinessStatus;

    @ApiProperty({
      required: false,
    })
    @IsString()
    @IsOptional()
      rejected_reason: string;
}
