import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import {
  GetAllProductsForAdminQuery,
  GetAllProductsForNonLoggedInUserQuery,
  GetAllProductsForLoggedInUserQuery,
} from 'src/modules/products/queries';

export interface GetProductsQuery {
  query:
    | GetAllProductsForAdminQuery
    | GetAllProductsForNonLoggedInUserQuery
    | GetAllProductsForLoggedInUserQuery;
  myProduct?: boolean;
  collaboratedProducts?: boolean;
  loggedInUser?: LoggedInUserInterface;
  isAdmin?: boolean;
}
