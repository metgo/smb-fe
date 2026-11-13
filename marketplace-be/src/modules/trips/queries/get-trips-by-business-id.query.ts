import { GetTripsByBusinessIdRequest } from '../request/get-trips-by-business-id.request';

export class GetTripsByBusinessIdQuery {
  constructor(
    public readonly businessId: string,
    public readonly query?: GetTripsByBusinessIdRequest,
  ) {}
}
