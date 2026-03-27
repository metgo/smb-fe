export interface GetProductRawQueryDto {
  categoriesId?: string[];
  subCategoriesId?: string[];
  accessibilitiesId?: string[];
  groupTypesId?: string[];
  campDetails?: any;
  search?: string;
}

export class GetProductRawQuery {
  constructor(readonly body: GetProductRawQueryDto) {}
}
