import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUserEngagementQuery {
  @ApiProperty({ type: String, required: true })
  @IsOptional()
    startDate: string;

  @ApiProperty({ type: String, required: true })
  @IsOptional()
    endDate: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    externalApi: string;
}
