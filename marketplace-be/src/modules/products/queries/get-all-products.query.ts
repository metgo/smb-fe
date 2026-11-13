import { GetAllProductsRequest } from '../requests/get-all-products.query';

export class GetAllProductsQuery {
  constructor(
    public readonly query: GetAllProductsRequest,
    public readonly customSelect?: string,
    public readonly customPopulate?: any[],
  ) {}
}
