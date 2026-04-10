import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/common/enum';

export class GetByCampCodeQueryRequest {
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
}
