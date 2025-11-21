export interface GetBusinessRawQueryDto {
  categoriesId?: string[];
  subCategoriesId?: string[];
  accessibilitiesId?: string[];
  groupTypesId?: string[];
  campDetails?: any;
  search?: string;
}

export class GetBusinessRawQuery {
  constructor(readonly body: GetBusinessRawQueryDto) {}
}
