import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray, IsNotEmpty, IsObject, IsOptional, IsString,
} from 'class-validator';
import transformEmail from 'src/core/helper/transformEmail';

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
 @ApiProperty({ type: String, description: 'Name of social Media' })
   name: string;

  @ApiProperty({ type: String, description: 'url of social media' })
    url: String;
}

class geoLocation {
 @ApiProperty({ type: String, description: 'Latitide of map' })
   name: string;

  @ApiProperty({ type: String, description: 'longitude of map' })
    url: String;
}
export class createBusinessDto {
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
  address: string;

@ApiProperty({
  required: true,
})
    @IsNotEmpty()
    @IsString()
  phoneNumber: string;

@ApiProperty({
  required: true,
})
    @IsString()
    @Transform(transformEmail)
  busiEmail: string;

@ApiProperty({
  required: true,
})
    @IsNotEmpty()
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
    @IsString()
  collabrationUser: [];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    geoLocation: geoLocation;

@ApiProperty({
  required: false,
})
    @IsOptional()
    @IsArray()
  images: images;

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
  mapPointId: [];

@ApiProperty({
  required: false,
})
    @IsOptional()
    @IsArray()
  mapPointCategoriesId: [];

@ApiProperty({
  required: false,
})
   @IsOptional()
    @IsArray()
  mapPointSubCategoriesId: [];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsObject()
    openingHrs: OpeningHours;
}
