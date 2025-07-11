import { GetByCampCodeQueryRequest } from 'src/common/request/get-by-camp-code.request';

export class GetSearchRecommendationQuery {
  constructor(public readonly query: GetByCampCodeQueryRequest) {}
}
