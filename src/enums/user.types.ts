export const UserRole = {
  TRAVELLER: "traveller",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
  DMO: "dmo",
  DMOADMIN: "dmoadmin",
  AUTHORITY: "authority",
  AUTHORITY_ADMIN: "authorityAdmin",
  SITE_MANAGER: "siteManager",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
