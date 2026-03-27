import { SortOrder } from 'src/common/enum';
import { ServicesTypes } from '../dashboard.type';

export class GetAllFeedItemsQuery {
  constructor(
    readonly identifierId?: string,
    readonly campCode?: string,
    readonly groupTypesId?: string[],
    readonly accessibilitiesId?: string[],
    readonly categoriesId?: string[],
    readonly subCategoriesId?: string[],
    readonly sortBy?: string,
    readonly sortOrder?: SortOrder,
    readonly serviceType?: ServicesTypes[],
    readonly search?: string,
    readonly page?: number,
    readonly limit?: number,
  ) {}
}
