import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import {
  BusinessStatus,
  GeoServicesTypes,
} from 'src/modules/business/business.type';

export class GetALLBusinessProductStatsquery {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
    startDate: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
    endDate: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    categoriesId: string[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    dmoId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    authorityId: string;

  @ApiProperty({
    type: 'enum',
    enum: BusinessStatus,
    required: false,
  })
  @IsEnum(BusinessStatus)
  @IsOptional()
    status: BusinessStatus;

  @ApiProperty({
    type: 'enum',
    enum: GeoServicesTypes,
    required: false,
  })
  @IsEnum(GeoServicesTypes)
  @IsOptional()
    serviceType: GeoServicesTypes;
}
