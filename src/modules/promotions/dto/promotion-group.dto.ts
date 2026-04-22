import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionPlacementType, PromotionRotationType } from 'src/common/enum';

class PromoOrderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    promoId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
    order: number;
}

class PlacementGroupDto {
  @IsEnum(PromotionPlacementType)
  @IsNotEmpty()
  @ApiProperty({ enum: PromotionPlacementType })
    placement: PromotionPlacementType;

  @IsEnum(PromotionRotationType)
  @IsNotEmpty()
  @ApiProperty({ enum: PromotionRotationType })
    rotationType: PromotionRotationType;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 0 })
    timeInterval?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromoOrderDto)
  @IsOptional()
  @ApiProperty({ type: [PromoOrderDto], required: false })
    promotions?: PromoOrderDto[];
}

export class CreatePromotionGroupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    externalApiId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlacementGroupDto)
  @IsNotEmpty()
  @ApiProperty({ type: [PlacementGroupDto] })
    placementGroup: PlacementGroupDto[];
}

export class UpdatePromotionGroupDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlacementGroupDto)
  @IsOptional()
  @ApiProperty({ type: [PlacementGroupDto], required: false })
    placementGroup?: PlacementGroupDto[];
}
