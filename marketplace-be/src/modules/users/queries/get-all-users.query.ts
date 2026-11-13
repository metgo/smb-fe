import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class GetAllUsersQuery extends CommonFilterQuery {
  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    isDeleted: string;
}
