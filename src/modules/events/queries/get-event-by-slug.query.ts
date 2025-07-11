import { GetByCampCodeQueryRequest } from 'src/common/request/get-by-camp-code.request';

export class GetEventBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly query: GetByCampCodeQueryRequest,
  ) {}
}
