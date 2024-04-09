import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { BusinessStatus } from 'src/modules/business/business.type';
import { CreateMapPointsDto } from 'src/modules/business/dto';

export class UpdateMapPointsByAdminDto extends CreateMapPointsDto {
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
