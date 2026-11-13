import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "./hooks";

export const useUserRoles = () => {
  const role = useAppSelector((state) => state.auth.userRole);

  return {
    isTraveller: role === UserRole.TRAVELLER,
    isSuperadmin: role === UserRole.SUPERADMIN,
    isDMO: role === UserRole.DMO,
    isAuthority: role === UserRole.AUTHORITY,
  };
};
