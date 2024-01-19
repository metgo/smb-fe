import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class FilterQuery extends CommonFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    businessId: string;
}
