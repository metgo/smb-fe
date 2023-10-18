import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createMapPointDto {
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
}

export class createMapPointCategoriesDto {
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
    required: true,
  })
  @IsNotEmpty()
    mapPointId: [];
}

export class createMapPointSubCategoriesDto {
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
    required: true,
  })
  @IsNotEmpty()
    mapPointId: [];

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
    mapPointCategoriesId: [];
}

export class createMapPointSubCategoriesItemDto {
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
