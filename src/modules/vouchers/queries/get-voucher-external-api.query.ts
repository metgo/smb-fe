import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

import { GetVoucherQuery } from 'src/modules/vouchers/queries';

export class GetVoucherByExternalApiQuery extends GetVoucherQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;
}
