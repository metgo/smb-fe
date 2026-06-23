import { GetSiteConfigByIdentifierIdRequest } from '../requests/get-site-config-by-identifierId.request';

export class GetSiteConfigByIdentifierIdQuery {
  constructor(
    public readonly identifierId: string,
    public readonly query: GetSiteConfigByIdentifierIdRequest,
  ) {}
}
