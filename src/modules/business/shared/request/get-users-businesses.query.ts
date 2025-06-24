import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { BusinessStatus } from 'src/modules/business/business.type';
import { GetAllUnpaginatedBusinessQuery } from 'src/modules/business/shared/request';

export class GetUsersBusinessesQuery extends GetAllUnpaginatedBusinessQuery {
  @ApiProperty({ type: 'enum', enum: BusinessStatus, required: false })
  @IsEnum(BusinessStatus)
  @IsOptional()
    status: BusinessStatus;
}
