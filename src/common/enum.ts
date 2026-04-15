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
  CANCELING = 'CANCELING',
  REFUND_IN_PROCESS = 'REFUND_IN_PROCESS',
  REFUND_SUCCESS = 'REFUND_SUCCESS',
  UNPAID = 'UNPAID',
}

export enum VoucherPaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  FAILED = 'FAILED',
}

export enum ItemStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export enum CommonStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export enum ItemType {
  ALL = 'ALL',
  BUSINESS = 'BUSINESS',
  PRODUCT = 'PRODUCT',
  EVENT = 'EVENT',
  FUNDAY = 'FUNDAY',
  TRIP = 'TRIP',
}
export enum NotificationType {
  ALL = 'ALL',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ACTION = 'ACTION',
  ERROR = 'ERROR',
  URGENT = 'URGENT',
}

export enum NotifReadType {
  ALL = 'ALL',
  READ = 'READ',
  UNREAD = 'UNREAD',
}

export enum Currency {
  ILS = 'ILS',
  AUD = 'AUD',
  USD = 'USD',
}

export enum Locale {
  ENGLISH = 'en',
  HEBREW = 'he',
  ARABIC = 'ar',
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
