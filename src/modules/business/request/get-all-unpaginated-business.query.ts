import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { GetAllBusinessesForGuestQuery } from 'src/modules/business/request/get-all-businesses-for-guest-user.query';

export class GetAllUnpaginatedBusinessQuery extends GetAllBusinessesForGuestQuery {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
    authorityId: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
    dmoId: string;
}
