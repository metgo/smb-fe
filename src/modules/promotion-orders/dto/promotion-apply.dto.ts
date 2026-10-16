import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromotionApplyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Business ID.',
  })
    businessId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Optional session id. If not provided, backend will generate one automatically.',
    required: false,
  })
    sessionId?: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'This vendor\'s current cart subtotal, checked server-side against the Lion Coin threshold.',
  })
    totalAmount: number;
}

export class PromotionReleaseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Business ID.',
  })
    businessId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Optional session id. If not provided, any reservation for this business will be released.',
    required: false,
  })
    sessionId?: string;
}

export class PromotionListDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Business IDs to look up reserved/redeemed Lion Coin status for.',
    type: [String],
  })
    businessIds: string[];
}
