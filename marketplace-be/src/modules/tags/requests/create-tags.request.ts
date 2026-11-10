import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTagsRequest {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    nameHe: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    nameAr: string;
}
