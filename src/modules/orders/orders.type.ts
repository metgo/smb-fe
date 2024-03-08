/* eslint-disable no-shadow */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  RETURNED = 'returned',
}

export enum PaymentMode {
  VOUCHER = 'voucher',
  CARD = 'card',
}
