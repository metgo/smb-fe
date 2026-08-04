import { GetEventBySlugRequest } from '../requests/get-event-by-slug.request';

export class GetEventBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly query: GetEventBySlugRequest,
  ) {}
}
