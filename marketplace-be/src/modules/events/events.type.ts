/* eslint-disable no-shadow */
// delete this enum if not used elsewhere
export enum EventPaymentMethod {
  TICKET = 'TICKET',
  EXTERNAL = 'EXTERNAL',
}

export enum EventType {
  PHYSICAL = 'PHYSICAL',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
}

export enum CommonQuestionAnswerType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  DROPDOWN = 'DROPDOWN',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
}

// recurring-event
export enum RecurringEventPattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum RecurringEventMonthlyType {
  SPECIFIC_DATE = 'SPECIFIC_DATE',
  RELATIVE_DAY = 'RELATIVE_DAY',
}

export enum RecurringEventCustomUnit {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum RecurringEventEndUnit {
  AFTER_OCCURRENCES = 'AFTER_OCCURRENCES',
  END_DATE = 'END_DATE',
}

// scheduled-notification-event
export enum NotificationChannel {
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
}

export enum ScheduledNotificationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
