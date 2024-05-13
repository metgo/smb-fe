import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

import { GetMyCreatedVouchersQuery } from 'src/modules/vouchers/queries';

export class GetMyVouchersQuery extends GetMyCreatedVouchersQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;
}
