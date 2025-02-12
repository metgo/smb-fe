import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CreateOrderDto } from '../dto';
import { Product } from 'src/modules/products/schema/products.schema';
import { ObjectId } from 'typeorm';

export interface CreateOrderCommand {
  loggedInUser: LoggedInUserInterface | null;
  body: CreateOrderDto;
  redeemedVouchers: [];
  totalAmount: number;
  actualAmountOfProduct: number;
  productInfo: Product[];
  cartItems: {
    id: ObjectId;
    quantity: number;
    address?: string;
    price: number;
  }[];
}
