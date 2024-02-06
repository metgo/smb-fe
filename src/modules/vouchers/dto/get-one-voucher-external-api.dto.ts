import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

import { GetOneVoucherQuery } from 'src/modules/vouchers/dto';

export class GetOneVoucherByExternalApiQuery extends GetOneVoucherQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;
}
