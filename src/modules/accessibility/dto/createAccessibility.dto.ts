import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createAccessibilityDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
    description: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    icon: string;
}
