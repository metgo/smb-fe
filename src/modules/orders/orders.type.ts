/* eslint-disable no-shadow */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing', // AFTER PAID
  SHIPPED = 'shipped', // BEGIN TO SHIP
  COMPLETED = 'completed', // PACKAGE RECEIVED BY CUSTOMER
  CANCELED = 'canceled',
  // RETURNED = 'returned',
}

export enum PaymentMode {
  VOUCHER = 'voucher',
  CARD = 'card',
}

export enum DeliveryMethod {
  PICK_UP = 'pick_up',
  DELIVER = 'deliver',
}

export enum OrderItemType {
  PRODUCT = 'PRODUCT',
  TICKET = 'TICKET',
  PUNCH_PASS = 'PUNCH_PASS',
}
