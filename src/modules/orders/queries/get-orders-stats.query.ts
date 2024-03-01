import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetOrdersStatsQuery {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    startDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    endDate: Date;
}
