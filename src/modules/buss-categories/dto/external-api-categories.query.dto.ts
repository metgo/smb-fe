import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Locale } from 'src/common/enum';
import { ExternalApiFilterQuery } from 'src/common/query-handler/external-api-filter.query';

export class ExternalApiCategoriesQuery extends ExternalApiFilterQuery {
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
  })
  @IsOptional()
  @IsEnum(Locale)
    locale: Locale;
}
