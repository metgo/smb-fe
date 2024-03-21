import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetByDateRangeQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    startDate: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    endDate: string;
}
