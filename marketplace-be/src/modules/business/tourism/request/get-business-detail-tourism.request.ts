import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsOptional, IsString, IsBoolean,
} from 'class-validator';
import { Locale } from 'src/common/enum';
import { Transform } from 'class-transformer';

export class GetBusinessDetailTourismRequest {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    campCode: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    identifierId: string;

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
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value; // let @IsBoolean() reject anything else
  })
  @IsBoolean()
    isTravel: boolean;
}
