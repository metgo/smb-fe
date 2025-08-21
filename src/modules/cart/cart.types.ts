import mongoose from 'mongoose';
import { DeliveryMethod, OrderItemType } from '../orders/orders.type';

/* eslint-disable no-shadow */
export enum CartStatus {
  PENDING = 'CREATED',
  TIME_OUT = 'TIMEOUT',
  ORDER_PLACED = 'ORDER_PLACED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
}

export interface CartProductPayload {
  id: mongoose.Types.ObjectId;
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
  itemType: OrderItemType;
}

export interface CartProductResponse extends CartProductPayload {
  amount: number;
}
