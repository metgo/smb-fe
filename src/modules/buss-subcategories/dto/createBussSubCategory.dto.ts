import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
  icon: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  bussCategoryId: [];
}
