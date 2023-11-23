import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { CampaignStatus } from 'src/common/enum';

export class createCampaignDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    description: string;

  @ApiProperty({ enum: CampaignStatus })
  @IsOptional()
    status: CampaignStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    code: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
    segment: [];

  @ApiProperty()
  @IsArray()
  @IsOptional()
    crowed: [];

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
    startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
    endDate: Date;
}
