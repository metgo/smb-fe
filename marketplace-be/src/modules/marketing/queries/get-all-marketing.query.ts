import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';

export class GetAllMarketingQuery {
  constructor(public readonly request: ExternalApiPostQuery) {}
}
