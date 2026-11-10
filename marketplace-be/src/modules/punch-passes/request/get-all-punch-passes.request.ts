import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class GetAllPunchPassesRequest extends CommonFilterQuery {
  @ApiProperty({
    required: false,
    description: 'Only return punch passes for this business',
  })
  @IsOptional()
  @IsMongoId()
    businessId: string;
}
