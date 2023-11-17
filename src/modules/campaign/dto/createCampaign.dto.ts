import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString,
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

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
    amount: number;

  @ApiProperty({ enum: CampaignStatus })
  @IsOptional()
    status: CampaignStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    code: string;
}
