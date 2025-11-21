import { ApiProperty } from '@nestjs/swagger';
import { ServicesTypes } from '../dashboard.type';

class GeoLocationDto {
  @ApiProperty({ type: String, nullable: true })
    lat: string | null;

  @ApiProperty({ type: String, nullable: true })
    long: string | null;
}

export class GetAllFeedItemResponse {
  @ApiProperty({ type: String })
    _id: string;

  @ApiProperty({ type: String })
    name: string;

  @ApiProperty({ type: String, required: true })
    description: string;

  @ApiProperty({ type: GeoLocationDto, required: true })
    geoLocation?: GeoLocationDto;

  @ApiProperty({ type: [String], required: true })
    images?: string[];

  @ApiProperty({ type: String, required: true })
    primaryCategoryId: string;

  @ApiProperty({ type: String, required: true })
    address: string;

  @ApiProperty({ type: String, required: true })
    slug: string;

  @ApiProperty({ enum: ServicesTypes })
    serviceType: ServicesTypes;
}
