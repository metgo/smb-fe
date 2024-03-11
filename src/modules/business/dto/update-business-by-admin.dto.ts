import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { WebCreateBusiness } from './web-create-business.dto';

export class UpdateBusinessByAdminDto extends WebCreateBusiness {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    rejected_reason: string;
}
