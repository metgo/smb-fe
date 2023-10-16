import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createMapPointDto {
    @IsNotEmpty()
    @IsString()
      name: string;

  @IsOptional()
    @IsString()
    icon: string;

  @IsOptional()
    @IsString()
    pathAlt: string;
}

export class createMapPointCategoriesDto {
    @IsNotEmpty()
    @IsString()
      name: string;

  @IsOptional()
    @IsString()
    icon: string;

  @IsOptional()
    @IsString()
    pathAlt: string;

    @IsNotEmpty()
      mapPointId: [];
}

export class createMapPointSubCategoriesDto {
    @IsNotEmpty()
    @IsString()
      name: string;

  @IsOptional()
    @IsString()
    icon: string;

  @IsOptional()
    @IsString()
    pathAlt: string;

    @IsNotEmpty()
      mapPointId: [];

    @IsNotEmpty()
      mapPointCategoriesId: [];
}

export class createMapPointSubCategoriesItemDto {
    @IsNotEmpty()
    @IsString()
      name: string;

  @IsOptional()
    @IsString()
    icon: string;

  @IsOptional()
    @IsString()
    pathAlt: string;

  @IsNotEmpty()
    mapPointId: [];

  @IsNotEmpty()
    mapPointCategoriesId: [];

  @IsNotEmpty()
    mapPointSubCategoriesId: [];
}
