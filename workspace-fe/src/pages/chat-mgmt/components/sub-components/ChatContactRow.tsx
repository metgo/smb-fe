import clsx from "clsx";
import { Info } from "lucide-react";

import { getInitials } from "@/helpers";
import { getPresenceLabel, ChatUserRoleBadge } from "./chatUsersListShared";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ChatContactRowProps {
  user: IChatUser;
  timeAgo: (iso: string) => string;
  presence: Record<string, IPresenceEntry>;
  onStartDm?: (recipientId: string) => void;
  onOpenProfile: (email: string) => void;
}

export const ChatContactRow: React.FC<ChatContactRowProps> = ({
  user,
  timeAgo,
  presence,
  onStartDm,
  onOpenProfile,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
  } = useThemeClasses();

  return (
    <div
      onClick={() => onStartDm?.(user._id)}
      className={clsx(
        "w-full text-left py-3 flex items-center gap-3 transition-all duration-200 select-none cursor-pointer",
        hoverBg,
      )}
    >
      <div className="relative shrink-0">
        <div
          className={clsx(
            "w-8 h-8 rounded-full border shrink-0 flex items-center justify-center font-bold text-sm",
            borderColor,
            isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600",
          )}
        >
          {getInitials(user.name)}
        </div>
        {presence[user._id]?.isOnline && (
          <span
            className={clsx(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2",
              isDark ? "border-gray-900" : "border-white",
            )}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={clsx("text-sm font-bold truncate", textPrimary)}>
            {user.name}
          </p>
          <ChatUserRoleBadge role={user.role} isDark={isDark} />
        </div>
        <p className={clsx("text-xs truncate", textSecondary)}>
          {getPresenceLabel(presence, t, timeAgo, user._id) || user.email}
        </p>
      </div>
      {user.email && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenProfile(user.email);
          }}
          title={t("view_profile")}
          className={clsx(
            "p-1.5 rounded-full cursor-pointer transition-colors shrink-0",
            textTertiary,
            isDark ? "hover:text-teal-400" : "hover:text-teal-600",
          )}
        >
          <Info className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
