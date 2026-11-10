import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

import { VoucherPaymentStatus, VoucherStatus } from 'src/common/enum';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class GetVouchersByAdminQuery extends CommonFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    campId: string;

  @ApiProperty({ enum: VoucherPaymentStatus, required: false })
  @IsEnum(VoucherPaymentStatus)
  @IsOptional()
    paymentStatus: VoucherPaymentStatus;

  @ApiProperty({ enum: VoucherStatus, required: false })
  @IsEnum(VoucherStatus)
  @IsOptional()
    status: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    dmoId: string;
}
