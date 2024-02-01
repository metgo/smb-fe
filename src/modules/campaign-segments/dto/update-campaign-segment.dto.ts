import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
} from 'class-validator';

export class UpdateCampaignSegmentDTO {
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
