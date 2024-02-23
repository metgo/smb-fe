import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { BusinessStatus } from 'src/modules/business/business.type';
import { GetAllBusinessesForGuestQuery } from 'src/modules/business/queries/get-all-businesses-for-guest-user.query';

export class GetUsersBusinessesQuery extends GetAllBusinessesForGuestQuery {
  @ApiProperty({ type: 'enum', enum: BusinessStatus, required: false })
  @IsEnum(BusinessStatus)
  @IsOptional()
    status: BusinessStatus;
}
