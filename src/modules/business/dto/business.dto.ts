import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
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

  @ApiProperty({
    type: String,
    description: 'Country code of phone number of contact person',
  })
    countryCode: string;

  @ApiProperty({ type: String, description: 'Phone numer of contact person' })
    phone: string;

  @ApiProperty({ type: String, description: 'Address of contact person' })
    address: string;

  @ApiProperty({ type: String, description: 'Email of contact person' })
    email: string;

  @ApiProperty({
    type: String,
    description: 'Country code of phone number of contact person whatsapp',
  })
    whatsAppCountryCode: string;

  @ApiProperty({ type: String, description: 'Phone numer of contact person' })
    whatsAppNumber: string;

  @ApiProperty({ type: String, description: 'Phone numer of contact person' })
    prefferedChannel: string;
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

class DeliveryArea {
  @ApiProperty({ type: String, description: 'DeliveryArea' })
    area: string;

  @ApiProperty({ type: String, description: 'Price to deliver to the area' })
    price: string;

  @ApiProperty({ type: String, description: 'Pickup location in that area' })
    pickUpLocation: string;
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
    required: false,
  })
  @IsOptional()
  @IsString()
    description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    shortDescription: string;

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
    authorityId: string;

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

  @ApiProperty({
    required: false,
    type: [images],
  })
  @IsOptional()
  @IsArray()
    images: images[];

  @ApiProperty({
    required: false,
    type: [socialMedia],
  })
  @IsOptional()
  @IsArray()
    socialMedia: socialMedia[];

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
  @IsString()
    primaryCategoryId: string;

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
    isAlwaysOpen: boolean;

  @ApiProperty({
    required: false,
    type: [OpeningHours],
  })
  @IsOptional()
  @IsArray()
    openingHrs: OpeningHours[];

  @ApiProperty({
    required: false,
    type: [DeliveryArea],
  })
  @IsOptional()
  @IsArray()
    deliveryArea: DeliveryArea[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    deliverySpecificSellerInfo: string[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    deliveryReturnExchange: string[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    deliveryAdditionalInfo: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    isPickUpAvailable: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
    completionPercent: number;
}
