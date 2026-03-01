export const IOpMode = {
  EDIT: "EDIT",
  VIEW: "VIEW",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  CLOSED: "CLOSED",
  DUPLICATE: "DUPLICATE",
} as const;

export type IOpMode = (typeof IOpMode)[keyof typeof IOpMode];
