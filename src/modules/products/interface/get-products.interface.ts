import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { GetAllProductsForNonLoggedInUserQuery, GetAllProductsForLoggedInUserQuery } from 'src/modules/products/queries';

export interface GetProductsQuery {
    query: GetAllProductsForNonLoggedInUserQuery | GetAllProductsForLoggedInUserQuery,
    myProduct?: boolean,
    collaboratedProducts?: boolean,
    loggedInUser?: LoggedInUserInterface,
    isAdmin?:boolean,
}
