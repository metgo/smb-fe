import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReportNoResultRequest {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    keyword: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    websiteUrl?: string;
}
