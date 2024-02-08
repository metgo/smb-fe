import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsObject, IsOptional, IsString,
} from 'class-validator';

class geoLocation {
  @ApiProperty({ type: [String], description: 'Latitide of map' })
    lat: string[];

  @ApiProperty({ type: [String], description: 'longitude of map' })
    long: string[];
}

export class CityDTO {
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
    authorityId: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsObject()
    geoLocation: geoLocation;
}
