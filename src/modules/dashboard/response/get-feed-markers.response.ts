import { ApiProperty } from '@nestjs/swagger';
import { ServicesTypes } from '../dashboard.type';

class GeoLocationDto {
  @ApiProperty({ type: String, nullable: true })
    lat: string | null;

  @ApiProperty({ type: String, nullable: true })
    long: string | null;
}

export class FeedMarkerItem {
  @ApiProperty({ type: String })
    _id: string;

  @ApiProperty({ type: String, nullable: true })
    businessId?: string;

  @ApiProperty({ type: String })
    slug: string;

  @ApiProperty({ enum: ServicesTypes })
    serviceType: string;

  @ApiProperty({ type: GeoLocationDto })
    geoLocation: GeoLocationDto;

  @ApiProperty({ type: String })
    primaryCategoryId: string;
}

export class GetFeedMarkersResponse {
  @ApiProperty({ type: [FeedMarkerItem] })
    data: FeedMarkerItem[];

  @ApiProperty()
    totalData: number;
}
