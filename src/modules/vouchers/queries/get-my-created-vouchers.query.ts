import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { VoucherStatus } from 'src/common/enum';
import { GetMyAssignedVouchersQuery } from 'src/modules/vouchers/queries';

export class GetMyCreatedVouchersQuery extends GetMyAssignedVouchersQuery {
  @ApiProperty({ enum: VoucherStatus, required: false })
  @IsOptional()
    status: VoucherStatus;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    identifierId: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    createdStartDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    createdEndDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    expiryStartDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    expiryEndDate: Date;
}
