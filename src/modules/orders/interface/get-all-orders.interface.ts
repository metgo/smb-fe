import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { GetAllOrdersQuery } from 'src/modules/orders/queries/get-all-orders.query';

export interface GetAllOrdersInterface {
  query: GetAllOrdersQuery;
  myOrder?: boolean;
  loggedInUser: LoggedInUserInterface;
}
