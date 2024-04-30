import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import {
  BusinessStatus,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import { GetAllBusinessesForGuestQuery } from 'src/modules/business/queries/get-all-businesses-for-guest-user.query';

export class GetUsersBusinessesQuery extends GetAllBusinessesForGuestQuery {
  @ApiProperty({ type: 'enum', enum: BusinessStatus, required: false })
  @IsEnum(BusinessStatus)
  @IsOptional()
    status: BusinessStatus;

  @ApiProperty({
    type: 'enum',
    enum: GeoServicesTypes,
    required: false,
  })
  @IsEnum(GeoServicesTypes)
  @IsOptional()
    serviceType: GeoServicesTypes;

  @ApiProperty({
    type: String,
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    dmoId: string;
}
