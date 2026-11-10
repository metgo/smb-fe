import clsx from "clsx";
import { Info } from "lucide-react";

import { getInitials } from "@/helpers";
import { getRoleBadgeClasses, roleIcons } from "./chatUsersListShared";

interface ChatCurrentUserFooterProps {
  currentUser: IChatUser;
  t: (key: string) => string;
  isDark: boolean;
  textPrimary: string;
  textTertiary: string;
  borderColor: string;
  onOpenProfile: (email: string) => void;
}

export const ChatCurrentUserFooter: React.FC<ChatCurrentUserFooterProps> = ({
  currentUser,
  t,
  isDark,
  textPrimary,
  textTertiary,
  borderColor,
  onOpenProfile,
}) => {
  const roleBadgeClasses = getRoleBadgeClasses(isDark);
  const RoleIcon = roleIcons[currentUser.role];

  return (
    <div
      className={clsx(
        "shrink-0 border-t p-3 flex items-center gap-3",
        borderColor,
      )}
    >
      <div
        className={clsx(
          "w-10 h-10 rounded-full border border-green-500 shrink-0 flex items-center justify-center font-bold text-sm",
          isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600",
        )}
      >
        {getInitials(currentUser.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx("text-sm font-bold truncate", textPrimary)}>
          {currentUser.name}
        </p>
        <span
          className={clsx(
            "inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize",
            roleBadgeClasses[currentUser.role],
          )}
        >
          <RoleIcon className="w-2.5 h-2.5" />
          {currentUser.role}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onOpenProfile(currentUser.email)}
        title={t("view_profile")}
        className={clsx(
          "p-1.5 rounded-full cursor-pointer transition-colors shrink-0",
          textTertiary,
          isDark ? "hover:text-teal-400" : "hover:text-teal-600",
        )}
      >
        <Info className="w-4 h-4" />
      </button>
    </div>
  );
};
