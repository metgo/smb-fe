import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray, IsBoolean, IsObject, IsOptional, IsString,
} from 'class-validator';
import transformEmail from 'src/core/helper/transformEmail';

class Address {
  @ApiProperty({ type: String })
    country: string;

  @ApiProperty({ type: String })
    city: string;

  @ApiProperty({ type: String })
    location: string;

  @ApiProperty({ type: String })
    additional_information: string;
}

class OpeningHours {
  @ApiProperty({ type: String, description: 'Days of operation' })
    days: string;

  @ApiProperty({ type: Date, description: 'Opening time' })
    open: Date;

  @ApiProperty({ type: Date, description: 'Closing time' })
    close: Date;

  @ApiProperty({
    type: Boolean,
    description: 'Is it a holiday?',
    default: false,
  })
    isHoliday: boolean;
}

class ContactDetails {
  @ApiProperty({ type: String, description: 'Name of contact person' })
    name: string;

  @ApiProperty({ type: String, description: 'Country code of phone number of contact person' })
    countryCode: string;

  @ApiProperty({ type: String, description: 'Phone numer of contact person' })
    phone: string;

  @ApiProperty({ type: String, description: 'address of contact person' })
    address: string;
}

class images {
  @ApiProperty({ type: String, description: 'path of image' })
    image: string;

  @ApiProperty({ type: String, description: 'caption of image' })
    caption: String;

  @ApiProperty({ type: String, description: 'Image alternative text' })
    alt: String;
}

class socialMedia {
  @ApiProperty({ type: String, description: 'Id  of social Media' })
    socialMediaId: string;

  @ApiProperty({ type: String, description: 'Url of social media' })
    url: String;
}

class geoLocation {
  @ApiProperty({ type: String, description: 'Latitide of map' })
    lat: string;

  @ApiProperty({ type: String, description: 'longitude of map' })
    long: string;
}
export class createBusinessDto {
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
    address: Address;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    countryCode: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    phoneNumber: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsOptional()
  @Transform(transformEmail)
    busiEmail: string;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
    description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsObject()
    contactDetails: ContactDetails;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
    collabrationUser: [];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    dmoId: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
    isPreview: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsObject()
    geoLocation: geoLocation;

  // @ApiProperty({
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray()
  //   images: images[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
    socialMedia: socialMedia;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
    groupTypesId: [];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
    accessibilitiesId: [];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
    bussCategoriesId: [];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
    bussSubCategoriesId: [];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Tags should not be more than 5' })
    tags: string[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
    openingHrs: OpeningHours;
}
