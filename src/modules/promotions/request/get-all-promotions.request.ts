import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsEnum, IsOptional, IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';
import { PromotionPlacementType } from 'src/common/enum';

export class GetAllPromotionsRequest extends PaginationFilterQuery {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
    search?: string;

  @ApiProperty({ enum: PromotionPlacementType, required: false })
  @IsEnum(PromotionPlacementType)
  @IsOptional()
    placement?: PromotionPlacementType;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
    isActive?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
    externalApiId?: string;
}
