import { GetSearchRequest } from '../request/get-search-request';

export class GetCombinedSearchQuery {
  constructor(public readonly query: GetSearchRequest) {}
}
