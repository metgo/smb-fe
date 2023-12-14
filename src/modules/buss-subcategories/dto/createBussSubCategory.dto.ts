import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createBussSubCategoryDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    icon: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
    bussCategoryId: [];

  @ApiProperty()
  @IsOptional()
  @IsString()
    hebrewName: string;
}
