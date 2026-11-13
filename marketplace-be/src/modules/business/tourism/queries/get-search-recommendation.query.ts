import { GetByCampCodeQueryRequest } from '../../shared/request/get-by-campcode.request';

export class GetSearchRecommendationQuery {
  constructor(public readonly query: GetByCampCodeQueryRequest) {}
}
