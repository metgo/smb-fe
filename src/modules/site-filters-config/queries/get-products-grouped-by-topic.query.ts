import { GetProductsGroupedByTopicRequest } from '../requests/get-products-grouped-by-topic.request';

export class GetProductsGroupedByTopicQuery {
  constructor(
    public readonly siteSettingId: string,
    public readonly query: GetProductsGroupedByTopicRequest,
  ) {}
}
