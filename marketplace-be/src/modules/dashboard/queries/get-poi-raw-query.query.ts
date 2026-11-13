export interface GetPOIRawQueryDto {
  categoriesId?: string[];
  subCategoriesId?: string[];
  accessibilitiesId?: string[];
  groupTypesId?: string[];
  campDetails?: any;
  search?: string;
}

export class GetPOIRawQuery {
  constructor(readonly body: GetPOIRawQueryDto) {}
}
