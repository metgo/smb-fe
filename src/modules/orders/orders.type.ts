import { FilterQuery } from 'src/modules/orders/dto/query.dto';

/* eslint-disable no-shadow */
export enum OrderStatus {
    PENDING= 'pending',
    PROCESSING= 'processing',
    SHIPPED= 'shipped',
    DELIVERED= 'delivered',
    CANCELED= 'canceled',
    RETURNED = 'returned',
}

export enum PaymentMode {
    VOUCHER = 'voucher',
    CARD = 'card',
}

export interface FindOrdersQuery {
    query: FilterQuery,
    myOrder?: boolean,
    loggedInUser?: string,
}
