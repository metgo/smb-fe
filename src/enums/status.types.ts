export const ItemStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
} as const;

export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];
