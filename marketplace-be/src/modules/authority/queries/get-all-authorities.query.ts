import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class GetAllAuthoritiesQuery extends CommonFilterQuery {
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
    dmoId: string[];
}
