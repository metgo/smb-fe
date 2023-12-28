import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { createBusinessDto } from './business.dto';
import { BusinessStatus } from 'src/modules/business/business.type';

export class WebCreateBusiness extends createBusinessDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    userId: string;

  @ApiProperty({
    type: 'enum',
    enum: BusinessStatus,
    required: true,
  })
  @IsOptional()
  @IsEnum(BusinessStatus)
    status: BusinessStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    rejected_reason: string;
}
