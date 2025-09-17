import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';

export class GetBlogByIdQuery {
  constructor(
    public readonly id: string,
    public readonly request: ExternalApiPostQuery,
  ) {}
}
