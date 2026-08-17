import clsx from "clsx";

import { getInitials } from "@/helpers";
import { getRoleBadgeClasses, roleIcons } from "./chatUsersListShared";

interface ChatActiveNowStripProps {
  t: (key: string, opts?: Record<string, unknown>) => string;
  isDark: boolean;
  textSecondary: string;
  textTertiary: string;
  borderColor: string;
  onlineUsers: IChatUser[];
  onlineCount: number;
  onStartDm?: (recipientId: string) => void;
}

export const ChatActiveNowStrip: React.FC<ChatActiveNowStripProps> = ({
  t,
  isDark,
  textSecondary,
  textTertiary,
  borderColor,
  onlineUsers,
  onlineCount,
  onStartDm,
}) => {
  const roleBadgeClasses = getRoleBadgeClasses(isDark);

  return (
    <div className={clsx("px-4 py-3 border-b", borderColor)}>
      <p
        className={clsx(
          "text-[11px] font-semibold uppercase tracking-wider mb-2",
          textTertiary,
        )}
      >
        {t("active_now")} ({onlineCount})
      </p>
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1">
        {onlineUsers.map((user) => {
          const RoleIcon = roleIcons[user.role];
          return (
            <button
              key={user._id}
              type="button"
              onClick={() => onStartDm?.(user._id)}
              title={`${user.name} (${user.role})`}
              className="flex flex-col items-center gap-1 shrink-0 w-14 cursor-pointer"
            >
              <div className="relative">
                <div
                  className={clsx(
                    "w-11 h-11 rounded-full border shrink-0 flex items-center justify-center font-bold text-sm",
                    borderColor,
                    isDark
                      ? "bg-gray-800 text-gray-200"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  {getInitials(user.name)}
                </div>
                <span
                  className={clsx(
                    "absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    isDark ? "border-gray-900" : "border-white",
                    roleBadgeClasses[user.role],
                  )}
                >
                  <RoleIcon className="w-4 h-4" />
                </span>
                <span
                  className={clsx(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2",
                    isDark ? "border-gray-900" : "border-white",
                  )}
                />
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium truncate w-full text-center",
                  textSecondary,
                )}
              >
                {user.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
