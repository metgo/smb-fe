import { ApiProperty } from '@nestjs/swagger';

export class ModelResponse {
  @ApiProperty({ type: String, nullable: false })
    _id: string;

  @ApiProperty({ type: String, nullable: true })
    hebrewName: string;
}

export class SubCategoryResponse extends ModelResponse {
  @ApiProperty({ type: String, nullable: false })
    categoryId: string;
}

export class GetAllFilterResponse {
  @ApiProperty({ type: ModelResponse, required: true })
    categories: ModelResponse[];

  @ApiProperty({ type: ModelResponse, required: true })
    accessibilities: ModelResponse[];

  @ApiProperty({ type: ModelResponse, required: true })
    groupTypes: ModelResponse[];

  @ApiProperty({ type: ModelResponse, required: true })
    subCategories: SubCategoryResponse[];
}

export class GetRawQueryResponse {
  @ApiProperty({ type: [String], required: true })
    categoriesIds: string[];

  @ApiProperty({ type: [String], required: true })
    accessibilitiesIds: string[];

  @ApiProperty({ type: [String], required: true })
    groupTypesIds: string[];

  @ApiProperty({ type: [String], required: true })
    subCategoriesIds: string[];
}
