import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CampaignType } from 'src/common/enum';

import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class FilterQuery extends CommonFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    dmoId: string;

  @ApiProperty({ enum: CampaignType })
  @IsOptional()
    type: CampaignType;
}
