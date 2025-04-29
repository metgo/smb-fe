import mongoose from 'mongoose';
import { DeliveryMethod } from 'src/modules/orders/orders.type';

export interface CreateOrderProductCommand {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  email: string;
  countryCode: string;
  phone: string;
  firstName: string;
  lastName: string;
  deliveryFee: number;
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
  loggedInUserId?: mongoose.Types.ObjectId | string;
  orderId: string;
}
