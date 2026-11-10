import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsOptional, IsString,
} from 'class-validator';
import { Locale } from 'src/common/enum';
import { Transform } from 'class-transformer';

export class GetProductsQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    campCode: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: false,
    default: Locale.HEBREW,
  })
  @IsOptional()
  @IsEnum(Locale)
    locale: Locale = Locale.HEBREW;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
    checkout?: boolean;
}
