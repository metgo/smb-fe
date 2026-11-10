import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Locale } from 'src/common/enum';

export class GetPromotionalItemsRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isBusiness?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isEvent?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isTrip?: string;

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
