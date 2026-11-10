import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { Locale } from 'src/common/enum';

export class GetProductsDeliveryRequest {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({
    required: true,
    isArray: true,
    type: String,
  })
  @IsNotEmpty()
    id: string[];

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
