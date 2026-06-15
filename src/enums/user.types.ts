export const UserRole = {
  TRAVELLER: "traveller",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
  DMO: "dmo",
  AUTHORITY: "authority",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
