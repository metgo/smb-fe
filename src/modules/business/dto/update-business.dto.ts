import { PartialType } from '@nestjs/mapped-types';
import { createBusinessDto } from './business.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber, IsObject, IsOptional, IsString,
} from 'class-validator';

class geoLocation {
  @ApiProperty({ type: String, description: 'Latitide of map' })
    lat: string;

  @ApiProperty({ type: String, description: 'longitude of map' })
    long: string;
}

export class updateBusinessDto extends PartialType(createBusinessDto) {
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
  @IsObject()
    geoLocation: geoLocation;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
    updatedPrimaryImageIndex: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
    updatedPrimaryImageURL: string;
}
