import { GetByCampCodeQueryRequest } from '../../shared/request/get-by-campcode.request';

export class GetBusinessDetailForMapTourismQuery {
  constructor(
    public readonly id: string,
    public readonly query: GetByCampCodeQueryRequest,
  ) {}
}
