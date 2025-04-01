import { GetAllProductsQuery } from '../requests/get-all-products.query';

export class GetAllProductsForMapQuery {
  constructor(public readonly query: GetAllProductsQuery) {}
}
