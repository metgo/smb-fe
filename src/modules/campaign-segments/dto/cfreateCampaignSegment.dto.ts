import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class createCampaignSegmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    campaign_ID: object;

  @ApiProperty()
  @IsArray()
  @IsOptional()
    DMOs: object;

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
