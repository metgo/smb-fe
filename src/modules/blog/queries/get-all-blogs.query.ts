import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';

export class GetAllBlogsQuery {
  constructor(public readonly request: ExternalApiPostQuery) {}
}
