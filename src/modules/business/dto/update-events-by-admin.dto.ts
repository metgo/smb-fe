import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { BusinessStatus } from 'src/modules/business/business.type';
import { CreateEventsDto } from 'src/modules/business/dto';

export class UpdateEventsByAdminDto extends CreateEventsDto {
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
