import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateTagsRequest {
  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
    name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    description: string;
}
