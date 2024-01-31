import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateCampaignSegmentDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    campaign_ID: string;

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
    crowed_origion: [];
}
