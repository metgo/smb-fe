import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { Product } from 'src/modules/products/schema/products.schema';

import { CreateOrderDto } from 'src/modules/orders/dto';
import { CartProductResponse } from 'src/modules/cart/cart.types';
import { Ticket } from 'src/modules/tickets/schema/tickets.schema';

export interface CreateOrderCommand {
  loggedInUser: LoggedInUserInterface | null;
  body: CreateOrderDto;
  redeemedVouchers: [];
  totalAmount: number;
  payableAmount: number;
  totalDeliveryFee: number;
  products: { id: string }[];
  productDetails: Product[];
  ticketDetails: Ticket[];
  cartItemsProduct: CartProductResponse[];
  cartItemsTicket: CartProductResponse[];
}

export interface CreateMiniSiteOrderInterface {
  loggedInUser: LoggedInUserInterface | null;
  body: CreateOrderDto;
  redeemedVouchers: {
    id: string;
    redeemedAmount: number;
  }[];
  totalAmount: number;
  payableAmount: number;
  totalDeliveryFee: number;
  products: { id: string }[];
  productDetails: Product[];
  cartItemsProduct: CartProductResponse[];
}
