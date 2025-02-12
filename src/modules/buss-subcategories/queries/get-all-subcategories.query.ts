import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';

export class GetAllSubCategoriesQuery extends LocaleFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    bussCategoryId: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;
}
