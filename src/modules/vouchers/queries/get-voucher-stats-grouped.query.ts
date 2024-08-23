import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CampaignType, SortByTimePeriod, VoucherStatus } from 'src/common/enum';

export class GetVoucherStatsGroupedQuery {
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

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
    campId: string[];

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    dmoId: string;

  @ApiProperty({ enum: SortByTimePeriod, required: false })
  @IsEnum(SortByTimePeriod)
  @IsOptional()
    sortBy: SortByTimePeriod;

  @ApiProperty({ enum: CampaignType })
  @IsOptional()
    campaignType: CampaignType;
}
