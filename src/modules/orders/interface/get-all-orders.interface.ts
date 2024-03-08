import { GetAllOrdersQuery } from 'src/modules/orders/queries/get-all-orders.query';

export interface GetAllOrdersInterface {
  query: GetAllOrdersQuery;
  myOrder?: boolean;
  loggedInUser?: string;
}
