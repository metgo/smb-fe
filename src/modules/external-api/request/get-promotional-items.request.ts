import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetPromotionalItemsRequest {
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    required: false,
    default: false,
    description: 'Whether to fetch promotional businesses',
  })
    isBusiness?: string;

  @IsOptional()
  @ApiProperty({
    type: Boolean,
    required: false,
    default: false,
    description: 'Whether to fetch promotional events',
  })
    isEvent?: string;

  @IsOptional()
  @ApiProperty({
    type: Boolean,
    required: false,
    default: false,
    description: 'Whether to fetch promotional trips',
  })
    isTrip?: string;
}
