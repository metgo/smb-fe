import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class GetTripsBySlugRequest {
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
