import { ObjectId } from 'typeorm';

import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { Product } from 'src/modules/products/schema/products.schema';

import { CreateOrderDto } from 'src/modules/orders/dto';
import { DeliveryMethod } from 'src/modules/orders/orders.type';

export interface CreateOrderCommand {
  loggedInUser: LoggedInUserInterface | null;
  body: CreateOrderDto;
  redeemedVouchers: [];
  totalAmount: number;
  actualAmountOfProduct: number;
  products: { id: string }[];
  productDetails: Product[];
  cartItems: {
    productId: ObjectId;
    quantity: number;
    email: string;
    countryCode: string;
    phone: string;
    firstName: string;
    lastName: string;
    deliveryMethod: DeliveryMethod;
    deliveryArea: string;
    deliveryPickupLocation: string;
    houseNo: string;
    apartment: string;
    city: string;
    street: string;
    isGift: boolean;
    additionalInfo: string;
    amount: number;
  }[];
}
