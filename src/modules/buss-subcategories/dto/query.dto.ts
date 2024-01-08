import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';

export class FilterQuery extends LocaleFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    bussCategoryId: string;
}
