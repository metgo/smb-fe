import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { GetAllOrdersRequest } from 'src/modules/orders/requests/get-all-orders.request';

export interface GetAllOrdersInterface {
  query: GetAllOrdersRequest;
  myOrder?: boolean;
  loggedInUser: LoggedInUserInterface;
}
