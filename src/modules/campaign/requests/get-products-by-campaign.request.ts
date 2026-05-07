import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Locale } from 'src/common/enum';
import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';

export class GetProductsByCampaignRequest extends PaginationFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    customerEmail: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    voucherId: string;

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
