import { GetProductsByTopicRequest } from '../requests/get-products-by-topic.request';

export class GetProductsByTopicQuery {
  constructor(
    public readonly externalApiId: string,
    public readonly query: GetProductsByTopicRequest,
  ) {}
}
