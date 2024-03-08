import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class createMPSubCategoriesItemsDto {
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
    required: false,
  })
  @IsOptional()
  @IsString()
    pathAlt: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
    hasMultiple: boolean;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
    mapPointId: [];

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
    mapPointCategoriesId: [];

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
    mapPointSubCategoriesId: [];
}
