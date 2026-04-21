import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { Locale } from 'src/common/enum';
import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';

export class GetAllBlogsRequest extends ExternalApiPostQuery {
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
    default: Locale.HEBREW,
  })
  @IsOptional()
  @IsEnum(Locale)
    locale: Locale = Locale.HEBREW;
}
