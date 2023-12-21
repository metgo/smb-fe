import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';

export class CommonFilterQuery extends PaginationFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;
}
