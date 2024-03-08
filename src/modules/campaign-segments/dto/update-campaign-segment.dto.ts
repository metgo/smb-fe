import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsEnum, IsNotEmpty, IsOptional,
} from 'class-validator';
import { CampaignSegmentOperation } from '../campaignSegment.type';

export class UpdateCampaignSegmentDTO {
  @ApiProperty({
    type: 'enum',
    enum: CampaignSegmentOperation,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(CampaignSegmentOperation)
    operation: CampaignSegmentOperation;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
    DMOs: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
    businesses: [];

  @ApiProperty()
  @IsArray()
  @IsOptional()
    products: [];

  @ApiProperty()
  @IsArray()
  @IsOptional()
    crowed_age: [];

  @ApiProperty()
  @IsArray()
  @IsOptional()
    crowed_origin: [];
}
