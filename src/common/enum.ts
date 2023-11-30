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
}

export enum VoucherPaymentStatus {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
    FAILED = 'FAILED',
}
