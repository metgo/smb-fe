import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import {
  UpdateProductByAdminDto,
  UpdateProductDto,
} from 'src/modules/products/dto';

export interface UpdateProductsCommand {
  productId: string;
  businessId: string;
  loggedInUser: LoggedInUserInterface;
  body: UpdateProductDto | UpdateProductByAdminDto;
  isAdmin: boolean;
}
