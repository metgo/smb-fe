import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';

export class GetAllProductsQuery extends CommonFilterQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    businessId: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    categoriesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    subCategoriesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    groupTypesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    accessibilitiesId: string[];

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    priceMin: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    priceMax: number;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
    vendorDelivers: boolean;
}
