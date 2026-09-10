export const UserRole = {
  SUPERADMIN: "superadmin",
  DMO: "dmo",
  AUTHORITY: "authority",
  TRAVELLER: "traveller",
  SITE_MANAGER: "siteManager",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
