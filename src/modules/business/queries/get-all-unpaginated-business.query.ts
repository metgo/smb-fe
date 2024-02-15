import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetAllUnpaginatedBusinessQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({ type: String, required: false, description: 'must follow the pattern \n [id, id,..]' })
  @IsOptional()
    groupTypesId: string;

  @ApiProperty({ type: String, required: false, description: 'must follow the pattern \n [id, id,..]' })
  @IsOptional()
    accessibilitiesId: string;

  @ApiProperty({ type: String, required: false, description: 'must follow the pattern \n [id, id,..]' })
  @IsOptional()
    bussCategoriesId: string;

  @ApiProperty({ type: String, required: false, description: 'must follow the pattern \n [id, id,..]' })
  @IsOptional()
    bussSubCategoriesId: string;

  @ApiProperty({ type: String, required: false, description: 'latitude of the location' })
  @IsOptional()
    lat: string;

  @ApiProperty({ type: String, required: false, description: 'longituted of the location' })
  @IsOptional()
    long: string;

  @ApiProperty({ type: Number, required: false, description: 'Miles for radius' })
  @IsOptional()
    miles: number;
}
