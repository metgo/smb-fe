import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { CampaignStatus } from 'src/common/enum';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    slogan: string;

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

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
    dmoIds: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
    categoryIds: string[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    rewardAmount: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    rewardVoucherLimit: number;
}
