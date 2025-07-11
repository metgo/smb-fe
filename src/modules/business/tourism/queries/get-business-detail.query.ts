import { GetByCampCodeQueryRequest } from '../../shared/request/get-by-campcode.request';

export class GetBusinessDetailForTourismQuery {
  constructor(
    public readonly slug: string,
    public readonly query: GetByCampCodeQueryRequest,
  ) {}
}
