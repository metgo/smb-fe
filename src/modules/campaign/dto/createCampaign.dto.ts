import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty, IsOptional, IsString, MinLength,
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
  @MinLength(4)
  @IsNotEmpty()
    code: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
    startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
    endDate: Date;
}
