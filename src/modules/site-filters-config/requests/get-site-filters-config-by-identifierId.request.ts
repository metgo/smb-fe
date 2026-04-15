import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean, IsEnum, IsOptional, IsString,
} from 'class-validator';
import { Locale } from 'src/common/enum';
import { ToBoolean } from 'src/core/decorators/to-boolean.decorator';

export class GetSiteFiltersConfigByIdentifierIdRequest {
  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
    default: Locale.HEBREW,
  })
  @IsOptional()
  @IsEnum(Locale)
    locale: Locale = Locale.HEBREW;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isMarketplace: boolean;

  @ApiPropertyOptional({
    description:
      'Filter by category name — returns only products for that category',
  })
  @IsOptional()
  @IsString()
    categoryName: string;
}
