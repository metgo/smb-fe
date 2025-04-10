import { GetAllSubCategoriesRequest } from '../requests/get-all-subcategories.request';

export class GetAllSubCategoriesQuery {
  constructor(public readonly body: GetAllSubCategoriesRequest) {}
}
