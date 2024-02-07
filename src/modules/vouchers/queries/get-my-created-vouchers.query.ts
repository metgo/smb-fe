import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { VoucherStatus } from 'src/common/enum';
import { GetMyAssignedVouchersQuery } from 'src/modules/vouchers/queries';

export class GetMyCreatedVouchersQuery extends GetMyAssignedVouchersQuery {
  @ApiProperty({ enum: VoucherStatus, required: false })
  @IsOptional()
    status: VoucherStatus;
}
