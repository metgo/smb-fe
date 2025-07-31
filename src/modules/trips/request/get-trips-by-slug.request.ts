import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { GetByCampCodeQueryRequest } from 'src/common/request/get-by-camp-code.request';

export class GetTripsBySlugRequest extends GetByCampCodeQueryRequest {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    isMap: string;
}
