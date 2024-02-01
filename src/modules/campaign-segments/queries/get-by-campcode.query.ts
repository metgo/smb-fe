import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';

export class GetByCampCodeQuery extends PaginationFilterQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;
}
