import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { SettingsDTO } from 'src/modules/settings/dto/settings.dto';

export class UpdateSettingsDto extends SettingsDTO {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    slug: string;
}
