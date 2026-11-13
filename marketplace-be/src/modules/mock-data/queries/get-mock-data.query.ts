import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetMockDataQuery {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    startDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    endDate: Date;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    isExternalApi: boolean;
}
