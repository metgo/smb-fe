import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @Min(0)
  @ApiProperty({
    description: 'This business\'s current cart subtotal (before discount). The server decides how many promotion vouchers it unlocks.',
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
  @IsNotEmpty()
  @ApiProperty({
    description: 'Session id returned by apply. Only this session\'s promotion vouchers are released.',
  })
    sessionId: string;
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

export class PromotionStateBusinessDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Business ID.' })
    businessId: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'This business\'s current cart subtotal (before discount).' })
    totalAmount: number;
}

export class PromotionStateDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PromotionStateBusinessDto)
  @ApiProperty({ type: [PromotionStateBusinessDto] })
    businesses: PromotionStateBusinessDto[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Session id, so the state includes the promotion vouchers this session holds.',
    required: false,
  })
    sessionId?: string;
}

// Sent with navigator.sendBeacon (form-encoded) when the buyer closes the payment page.
export class PromotionReleaseSessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Session id whose held promotion vouchers are released (except during a payment).',
  })
    sessionId: string;
}
