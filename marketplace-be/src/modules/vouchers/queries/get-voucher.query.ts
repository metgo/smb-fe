import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum,
} from 'class-validator';
import { Locale } from 'src/common/enum';

export class GetVoucherQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
    productId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
    identifierId?: string;

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
