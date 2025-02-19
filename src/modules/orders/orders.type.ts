/* eslint-disable no-shadow */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  CANCELED = 'canceled',
  RETURNED = 'returned',
}

export enum PaymentMode {
  VOUCHER = 'voucher',
  CARD = 'card',
}

export enum DeliveryMethod {
  PICK_UP = 'pick_up',
  DELIVER = 'deliver',
}
