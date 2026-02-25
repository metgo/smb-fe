import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum,
} from 'class-validator';
import { Locale } from 'src/common/enum';

export class GetVoucherQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    productId: string;

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
