import { GetPOIDetailRequest } from '../request/get-poi-detail.request';

export class GetPOIDetailQuery {
  constructor(readonly slug: string, readonly query: GetPOIDetailRequest) {}
}
