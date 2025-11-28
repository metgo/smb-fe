import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetPromotionalItemsRequest {
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Whether to fetch promotional businesses',
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isBusiness?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Whether to fetch promotional events',
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isEvent?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Whether to fetch promotional trips',
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
    isTrip?: string;
}
