import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortByTimePeriod } from 'src/common/enum';

export class GetOrdersStatsQuery {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    startDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    endDate: Date;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    dmoId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    authorityId: string;

  @ApiProperty({ enum: SortByTimePeriod, required: false })
  @IsEnum(SortByTimePeriod)
  @IsOptional()
    sortBy: SortByTimePeriod;
}
