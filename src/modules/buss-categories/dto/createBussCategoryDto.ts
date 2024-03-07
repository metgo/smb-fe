import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createBussCategoryDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    name: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    icon: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    iconBnW: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
    hebrewName: string;
}
