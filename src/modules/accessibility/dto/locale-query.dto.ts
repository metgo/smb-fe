import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { Locale } from 'src/common/enum';

export class LocaleQuery {
  @ApiProperty({
    type: 'enum',
    enum: Locale,
  })
  @IsOptional()
  @IsEnum(Locale)
    locale: Locale;
}
