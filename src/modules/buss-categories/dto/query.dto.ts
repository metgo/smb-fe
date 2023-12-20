import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty,
} from 'class-validator';
import { Locale } from 'src/common/enum';
import { CommonFilterQuery } from 'src/common/utils/common-filter-query';

export class FilterQuery extends CommonFilterQuery {
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Locale)
    locale: Locale;
}
