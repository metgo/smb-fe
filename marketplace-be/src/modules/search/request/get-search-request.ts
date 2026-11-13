import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { GetByCampCodeQueryRequest } from 'src/common/request/get-by-camp-code.request';

export class GetSearchRequest extends GetByCampCodeQueryRequest {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
    search: string;
}
