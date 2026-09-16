import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

import { Locale } from 'src/common/enum';

export class GetEventBySlugRequest {
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
    default: Locale.HEBREW,
  })
  @IsOptional()
  @IsEnum(Locale)
    locale: Locale = Locale.HEBREW;

  @ApiProperty({
    required: false,
    description: 'Include hidden tickets in the response (for special access links)',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
    showHidden?: boolean = false;
}
