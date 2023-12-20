import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { VoucherStatus } from 'src/common/enum';
import { CommonFilterQuery } from 'src/common/utils/common-filter-query';

export class FilterQuery extends CommonFilterQuery {
  @ApiProperty({ enum: VoucherStatus, required: false })
  @IsOptional()
    status: VoucherStatus;
}
