import { Transform } from 'class-transformer';
import {
  IsArray, IsNotEmpty, IsObject, IsOptional, IsString,
} from 'class-validator';
import transformEmail from 'src/core/helper/transformEmail';
import { IsEmailAlreadyExist } from 'src/core/validation/isEmailAlreadyExists';

export class createBusinessDto {
    @IsNotEmpty()
    @IsString()
      name: string;

    @IsNotEmpty()
    @IsString()
      address: string;

    @IsNotEmpty()
    @IsString()
      phoneNumber: string;

    @IsString()
    @IsEmailAlreadyExist({ message: 'email alreadys used by other business' })
    @Transform(transformEmail)
      busiEmail: string;

    @IsNotEmpty()
    @IsString()
      description: string;

    @IsOptional()
    @IsObject()
      contactDetails: {
            name: string,
            phone: string,
            address: string,
        };

    @IsOptional()
    @IsString()
      collabrationUser: [];

    @IsOptional()
    @IsString()
      geoLoaction: {
        lat: string,
        long: string
      };

    @IsOptional()
    @IsArray()
      images: [
        {
          image: string
          caption: string
          alt:string
        }
    ];

    @IsOptional()
    @IsArray()
      socialMedia: [
        {
            name: string
            url: string
        }
    ];

    @IsOptional()
    @IsArray()
      mapPointId: [];

    @IsOptional()
    @IsArray()
      mapPointCategoriesId: [];

   @IsOptional()
    @IsArray()
     mapPointSubCategoriesId: [];

   @IsOptional()
    @IsObject()
     openingHrs:
        {
          days: string
          open: Date
          close: Date
          isHoliday: {
            type: Boolean,
            default: false // Default value for isHoliday
          }
        };
}
