import { GetTripsBySlugRequest } from '../request/get-trips-by-slug.request';

export class GetTripBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly query: GetTripsBySlugRequest,
  ) {}
}
