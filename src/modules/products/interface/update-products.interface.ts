import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CreateProductByAdmin, ProductDto } from 'src/modules/products/dto';

export interface UpdateProductsCommand {
  productId: string;
  businessId: string;
  loggedInUser: LoggedInUserInterface;
  body: ProductDto | CreateProductByAdmin;
  isAdmin: boolean;
}
