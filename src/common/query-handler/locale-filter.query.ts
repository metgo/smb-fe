import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { Locale } from 'src/common/enum';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class LocaleFilterQuery extends CommonFilterQuery {
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
  })
  @IsOptional()
  @IsEnum(Locale)
    locale: Locale;
}
