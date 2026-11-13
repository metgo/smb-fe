import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum,
} from 'class-validator';
import { Locale } from 'src/common/enum';

export class GetVoucherByCodeQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
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
