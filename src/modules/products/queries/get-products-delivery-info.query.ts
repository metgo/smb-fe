import { GetProductsDeliveryRequest } from '../requests/get-products-delivery.query';

export class GetProductsDeliveryQuery {
  constructor(public readonly query: GetProductsDeliveryRequest) {}
}
