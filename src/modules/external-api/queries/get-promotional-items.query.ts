import { GetPromotionalItemsRequest } from '../request/get-promotional-items.request';

export class GetPromotionalItemsQuery {
  constructor(
    public readonly identifierId: string,
    public readonly query: GetPromotionalItemsRequest,
  ) {}
}
