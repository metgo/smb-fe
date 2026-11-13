import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { RegisterRequest } from 'src/modules/auth/requests/register.request';

export class ExternalApiRegisterRequest extends RegisterRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly identifierId: string;
}
