import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionMediaType, PromotionPlacementType } from 'src/common/enum';

class LocalizedFieldDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
    en?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
    he?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
    ar?: string;
}

class MediaUrlDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    desktop: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    mobile: string;
}

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    externalApiId: string;

  @ValidateNested()
  @Type(() => LocalizedFieldDto)
  @IsNotEmpty()
  @ApiProperty({ type: LocalizedFieldDto })
    title: LocalizedFieldDto;

  @ValidateNested()
  @Type(() => LocalizedFieldDto)
  @IsNotEmpty()
  @ApiProperty({ type: LocalizedFieldDto })
    description: LocalizedFieldDto;

  @IsEnum(PromotionPlacementType)
  @IsNotEmpty()
  @ApiProperty({ enum: PromotionPlacementType })
    placement: PromotionPlacementType;

  @IsEnum(PromotionMediaType)
  @IsNotEmpty()
  @ApiProperty({ enum: PromotionMediaType })
    mediaType: PromotionMediaType;

  @ValidateNested()
  @Type(() => MediaUrlDto)
  @IsNotEmpty()
  @ApiProperty({ type: MediaUrlDto })
    mediaUrl: MediaUrlDto;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    linkUrl: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true })
    isActive?: boolean;
}

export class UpdatePromotionDto {
  @ValidateNested()
  @Type(() => LocalizedFieldDto)
  @IsOptional()
  @ApiProperty({ type: LocalizedFieldDto, required: false })
    title?: LocalizedFieldDto;

  @ValidateNested()
  @Type(() => LocalizedFieldDto)
  @IsOptional()
  @ApiProperty({ type: LocalizedFieldDto, required: false })
    description?: LocalizedFieldDto;

  @IsEnum(PromotionPlacementType)
  @IsOptional()
  @ApiProperty({ enum: PromotionPlacementType, required: false })
    placement?: PromotionPlacementType;

  @IsEnum(PromotionMediaType)
  @IsOptional()
  @ApiProperty({ enum: PromotionMediaType, required: false })
    mediaType?: PromotionMediaType;

  @ValidateNested()
  @Type(() => MediaUrlDto)
  @IsOptional()
  @ApiProperty({ type: MediaUrlDto, required: false })
    mediaUrl?: MediaUrlDto;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
    linkUrl?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
    isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
    views?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
    clicks?: number;
}
