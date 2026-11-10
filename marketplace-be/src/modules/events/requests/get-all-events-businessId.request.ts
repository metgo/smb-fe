import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class GetAllEventsBusinessIdRequest extends CommonFilterQuery {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
    businessId: string[];
}
