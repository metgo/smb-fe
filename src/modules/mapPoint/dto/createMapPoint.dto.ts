import { IsNotEmpty, IsString } from 'class-validator';

export class createMapPointDto {
    @IsNotEmpty()
    @IsString()
      name: string;
}

export class createMapPointCategoriesDto {
    @IsNotEmpty()
    @IsString()
      name: string;

    @IsNotEmpty()
      mapPointId: [];
}

export class createMapPointSubCategoriesDto {
    @IsNotEmpty()
    @IsString()
      name: string;

    @IsNotEmpty()
      mapPointId: [];

    @IsNotEmpty()
      mapPointCatId: [];
}

export class createMapPointSubCategoriesItemDto {
    @IsNotEmpty()
    @IsString()
      name: string;

  @IsNotEmpty()
    mapPointId: [];

  @IsNotEmpty()
    mapPointCatId: [];

  @IsNotEmpty()
    mapPointSubCatId: [];
}
