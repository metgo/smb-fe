import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Locale } from 'src/common/enum';

export class FilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({
    type: 'enum',
    enum: Locale,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Locale)
    locale: Locale;
}
