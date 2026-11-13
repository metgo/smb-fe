import { GetAllCategoriesRequest } from '../requests/get-all-categories.request';

export class GetAllCategoriesQuery {
  constructor(public readonly body: GetAllCategoriesRequest) {}
}
