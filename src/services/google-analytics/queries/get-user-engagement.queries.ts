import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { ExternalApiTypes } from 'src/services/google-analytics/ga.types';

export class GetUserEngagementQuery {
  @ApiProperty({ type: String, required: true })
  @IsOptional()
    startDate: string;

  @ApiProperty({ type: String, required: true })
  @IsOptional()
    endDate: string;

  @ApiProperty({
    type: 'enum',
    enum: ExternalApiTypes,
    required: false,
  })
  @IsEnum(ExternalApiTypes)
  @IsOptional()
    externalApi: ExternalApiTypes;
}
