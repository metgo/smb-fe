/* eslint-disable no-shadow */
export enum CampaignStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum VoucherStatus {

    ASSIGNED = 'ASSIGNED',
    UNASSIGNED = 'UNASSIGNED',
    WAITING = 'WAITING',
    EXPIRED = 'EXPIRED',
    REDEEMED = 'REDEEMED',
}

export enum PaymentStatus {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    PENDING = 'PENDING'
}

export enum VoucherPaymentStatus {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
    FAILED = 'FAILED',
}

export enum Currency {
    ILS = 'ILS',
    AUD = 'AUD',
    USD = 'USD',
}
