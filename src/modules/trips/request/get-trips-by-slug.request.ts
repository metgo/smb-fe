import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

import { GetByCampCodeQueryRequest } from 'src/common/request/get-by-camp-code.request';

export class GetTripsBySlugRequest extends GetByCampCodeQueryRequest {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isMap: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isTrip?: boolean;
}
