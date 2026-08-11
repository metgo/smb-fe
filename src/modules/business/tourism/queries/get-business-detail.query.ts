import { GetBusinessDetailTourismRequest } from '../request/get-business-detail-tourism.request';

export class GetBusinessDetailForTourismQuery {
  constructor(
    public readonly slug: string,
    public readonly query: GetBusinessDetailTourismRequest,
  ) {}
}
