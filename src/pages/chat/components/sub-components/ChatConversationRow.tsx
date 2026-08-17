import clsx from "clsx";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getInitials } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  getRoleBadgeClasses,
  getPresenceLabel,
  getRoleIcon,
} from "./chatUsersListShared";

interface ChatConversationRowProps {
  conv: IConversation;
  active: boolean;
  dmUser?: IChatUser;
  timeAgo: (iso: string) => string;
  presence: Record<string, IPresenceEntry>;
  onSelectConversation: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, convId: string) => void;
  onOpenProfile: (email: string) => void;
}

export const ChatConversationRow: React.FC<ChatConversationRowProps> = ({
  conv,
  active,
  dmUser,
  timeAgo,
  presence,
  onSelectConversation,
  onContextMenu,
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

  const roleBadgeClasses = getRoleBadgeClasses(isDark);
  const unreadCount = conv.unreadCount || 0;

  let previewText = conv.lastMessage ? conv.lastMessage.text : "";
  if (conv.lastMessage?.isDeleted) {
    previewText = t("message_removed_by_admin");
  }
  // Truncate at 50 characters (Story 1)
  if (previewText.length > 50) {
    previewText = previewText.substring(0, 50) + "...";
  }

  const isBroadcast = conv.type === "broadcast";
  const isGroup = conv.type === "group";

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      onContextMenu={(e) =>
        conv.type !== "broadcast" && onContextMenu(e, conv.id)
      }
      className={clsx(
        "relative px-4 py-3 flex items-center gap-3 transition-all duration-200 select-none cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        active
          ? clsx(
              isDark
                ? "bg-teal-950/30 text-teal-100 shadow-md shadow-teal-500/10"
                : "bg-teal-50 text-teal-950 shadow-md shadow-teal-500/10",
              "border-l-4 border-teal-500",
            )
          : clsx(hoverBg),
      )}
      onClick={() => onSelectConversation(conv.id)}
    >
      <div className="relative shrink-0">
        <div
          className={clsx(
            "w-8 h-8 rounded-full border shrink-0 flex items-center justify-center font-bold text-sm",
            borderColor,
            isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600",
          )}
        >
          {getInitials(conv?.name)}
        </div>
        {dmUser && presence[dmUser._id]?.isOnline && (
          <span
            className={clsx(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2",
              isDark ? "border-gray-900" : "border-white",
            )}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={clsx(
              "text-sm font-bold truncate flex items-center gap-1.5",
              textPrimary,
            )}
          >
            {conv.name}
            {dmUser &&
              (() => {
                const RoleIcon = getRoleIcon(dmUser.role);
                return (
                  <span
                    className={clsx(
                      "px-2 py-0.5 text-[9px] font-bold rounded-full capitalize shrink-0 flex items-center gap-1",
                      dmUser.role && roleBadgeClasses[dmUser.role],
                    )}
                  >
                    <RoleIcon className="w-2.5 h-2.5" />
                    {dmUser.role}
                  </span>
                );
              })()}
            {isGroup && (
              <span
                className={clsx(
                  "px-1.5 py-0.5 text-[9px] font-bold rounded-sm border border-violet-200/50",
                  isDark
                    ? "bg-violet-900/30 text-violet-400"
                    : "bg-violet-50 text-violet-700",
                )}
              >
                {t("group")}
              </span>
            )}
            {isBroadcast && (
              <span
                className={clsx(
                  "px-1.5 py-0.5 text-[9px] font-bold rounded-sm border border-blue-200/50",
                  isDark
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-blue-50 text-blue-700",
                )}
              >
                {t("broadcast")}
              </span>
            )}
          </span>
          <span className={clsx("text-[10px] shrink-0", textTertiary)}>
            {conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : ""}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p
            className={clsx(
              "text-xs truncate flex-1",
              unreadCount > 0 ? clsx("font-bold", textPrimary) : textSecondary,
            )}
          >
            {previewText ? (
              <span
                className="line-clamp-1"
                dangerouslySetInnerHTML={{ __html: previewText }}
              />
            ) : dmUser && getPresenceLabel(presence, t, timeAgo, dmUser._id) ? (
              <span
                className={clsx(
                  presence[dmUser._id]?.isOnline
                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                    : textTertiary,
                )}
              >
                {getPresenceLabel(presence, t, timeAgo, dmUser._id)}
              </span>
            ) : (
              <span className={clsx("italic", textTertiary)}>
                {t("no_messages_yet")}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1">
            {dmUser?.email && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile(dmUser.email);
                }}
                title={t("view_profile")}
                className={clsx(
                  "p-0.5 rounded-full cursor-pointer transition-colors shrink-0",
                  textTertiary,
                  isDark ? "hover:text-teal-400" : "hover:text-teal-600",
                )}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
            {unreadCount > 0 && (
              <span className="min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
