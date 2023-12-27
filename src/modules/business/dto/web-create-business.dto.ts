import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { createBusinessDto } from './business.dto';

export class WebCreateBusiness extends createBusinessDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    userId: string;
}
