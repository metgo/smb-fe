import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional,
} from 'class-validator';

import { Locale } from 'src/common/enum';

export class FilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    bussCategoryId: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Locale)
    locale: Locale;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
    page: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
    limit: number;
}
