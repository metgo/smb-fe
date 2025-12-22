/* eslint-disable no-shadow */
export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  EXPIRED = 'EXPIRED',
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
  PENDING = 'PENDING',
  UNPAID = 'UNPAID',
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

export enum Locale {
  ENGLISH = 'en',
  HEBREW = 'he',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SortByTimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}
