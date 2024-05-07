import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { UserType } from 'src/modules/users/users.type';

export class GetAllUsersQuery extends CommonFilterQuery {
  @ApiProperty({ type: [UserType], required: false })
  @IsEnum(UserType, { each: true })
  @IsOptional()
    role: UserType[];

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    hasBusiness: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    isDeleted: string;
}
