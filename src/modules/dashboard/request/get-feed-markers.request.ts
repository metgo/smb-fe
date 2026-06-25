import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetFeedMarkersRequest {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    identifierId?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    campCode?: string;
}
