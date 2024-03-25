import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { UserType } from 'src/modules/users/users.type';

export class GetAllUsersQuery extends CommonFilterQuery {
  @ApiProperty({ enum: UserType, required: false })
  @IsOptional()
    role: UserType;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    hasBusiness: boolean;
}
