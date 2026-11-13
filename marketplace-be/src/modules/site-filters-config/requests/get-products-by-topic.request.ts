import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ToBoolean } from 'src/core/decorators/to-boolean.decorator';

export class GetProductsByTopicRequest extends LocaleFilterQuery {
  @ApiProperty({
    description:
      'Topic title to filter products by (matches title, titleHe, or titleAr)',
    isArray: true,
    type: String,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    topic: string[];

  @ApiProperty({
    description: 'Topic title to filter products by category',
    isArray: true,
    type: String,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    category: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    groupTypesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    accessibilitiesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    tagsId: string[];

  @ApiProperty({ required: false })
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
    hasDelivery: boolean;

  @ApiProperty({
    required: false,
    description: 'Center latitude for geo-radius filtering',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
    lat?: number;

  @ApiProperty({
    required: false,
    description: 'Center longitude for geo-radius filtering',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
    lng?: number;

  @ApiProperty({
    required: false,
    description: 'Radius in kilometers for geo-radius filtering',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
    radius?: number;

  @ApiProperty({
    required: false,
    description:
      'Voucher code applied via a QR/email deep link — when present, only products priced at or under the voucher\'s remaining amount are returned',
  })
  @IsOptional()
  @IsString()
    voucherCode?: string;

  @ApiProperty({
    required: false,
    description:
      'Frontend-only marker that a voucher is active on this request. Not read by the backend — voucherCode is the actual signal; voucherStatus in the response tells you the outcome.',
  })
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
    voucher?: boolean;
}
