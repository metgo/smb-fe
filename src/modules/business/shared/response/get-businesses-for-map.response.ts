import { ApiProperty } from '@nestjs/swagger';
import { Image } from 'src/common/interface/image.interface';

class Data {
  @ApiProperty({ required: true })
    _id: string;

  @ApiProperty()
    name: string;

  @ApiProperty()
    description: string;

  @ApiProperty()
    status: string;

  @ApiProperty()
    authorityId: string;

  @ApiProperty()
    dmoId: string;

  @ApiProperty()
    geoLocation: string;

  @ApiProperty()
    location: string;

  @ApiProperty({ type: [Image] })
    images: Image[];

  @ApiProperty()
    bussCategoriesId: string;

  @ApiProperty()
    bussSubCategoriesId: string;

  @ApiProperty()
    slug: string;
}

export class GetAllBusinessesForMapResponse {
  @ApiProperty({ type: [Data], required: true })
  readonly data: Data[];

  @ApiProperty({ required: true })
  readonly totalData: number;
}
