import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { VoucherStatus } from 'src/common/enum';

export class GetVoucherStatsQuery {
    @ApiProperty({ enum: VoucherStatus, required: false })
    @IsOptional()
      status: VoucherStatus;

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
