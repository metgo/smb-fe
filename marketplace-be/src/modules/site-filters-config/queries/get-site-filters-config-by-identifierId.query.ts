import { GetSiteFiltersConfigByIdentifierIdRequest } from '../requests/get-site-filters-config-by-identifierId.request';

export class GetSiteFiltersConfigByIdentifierIdQuery {
  constructor(
    public readonly identifierId: string,
    public readonly query: GetSiteFiltersConfigByIdentifierIdRequest,
  ) {}
}
