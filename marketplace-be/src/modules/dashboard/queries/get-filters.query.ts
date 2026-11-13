import { GetAllFiltersRequest } from '../request/get-all-filters.request';

export class GetFiltersQuery {
  constructor(public readonly body: GetAllFiltersRequest) {}
}
