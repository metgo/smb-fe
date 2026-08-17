import clsx from "clsx";
import {
  MessageSquare,
  Mail,
  Users,
  Megaphone,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  ChatUsersFilterPopover,
  type ChatUsersFilters,
} from "../ChatUsersFilterPopover";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

type TConversationTypeFilter = "all" | "dm" | "group" | "broadcast";

interface ChatUsersListHeaderProps {
  canCreateGroup: boolean;
  canManageBroadcasts: boolean;
  onOpenNewDm: () => void;
  onOpenNewGroup: () => void;
  onOpenNewBroadcast: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showFilterPopover: boolean;
  onToggleFilterPopover: () => void;
  onCloseFilterPopover: () => void;
  chatUsersFilters: ChatUsersFilters;
  onChatUsersFiltersChange: (filters: ChatUsersFilters) => void;
  appliedFilterCount: number;
  lockDmo: boolean;
  lockAuthority: boolean;
  typeFilter: TConversationTypeFilter;
  onTypeFilterChange: (filter: TConversationTypeFilter) => void;
  conversationTypeCounts: Record<TConversationTypeFilter, number>;
}

export const ChatUsersListHeader: React.FC<ChatUsersListHeaderProps> = ({
  canCreateGroup,
  canManageBroadcasts,
  onOpenNewDm,
  onOpenNewGroup,
  onOpenNewBroadcast,
  searchQuery,
  onSearchQueryChange,
  showFilterPopover,
  onToggleFilterPopover,
  onCloseFilterPopover,
  chatUsersFilters,
  onChatUsersFiltersChange,
  appliedFilterCount,
  lockDmo,
  lockAuthority,
  typeFilter,
  onTypeFilterChange,
  conversationTypeCounts,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    inputClasses,
  } = useThemeClasses();

  const typePills: {
    key: TConversationTypeFilter;
    label: string;
    icon: typeof Mail | null;
  }[] = [
    { key: "all", label: t("all"), icon: null },
    { key: "dm", label: t("direct_messages"), icon: Mail },
    { key: "group", label: t("groups"), icon: Users },
    ...(canManageBroadcasts
      ? [{ key: "broadcast" as const, label: t("broadcasts"), icon: Megaphone }]
      : []),
  ];

  return (
    <div className={clsx("p-4 border-b space-y-4", borderColor)}>
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={clsx(
              "text-lg font-bold tracking-tight flex items-center gap-2",
              textPrimary,
            )}
          >
            <MessageSquare className="w-5 h-5 text-teal-600" />
            {t("chats")}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNewDm}
            title={t("new_dm")}
            className={clsx(
              "p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
              textTertiary,
            )}
          >
            <Mail className="w-4 h-4" />
          </button>
          {canCreateGroup && (
            <button
              onClick={onOpenNewGroup}
              title={t("new_group_chat")}
              className={clsx(
                "p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                hoverBg,
                textTertiary,
              )}
            >
              <Users className="w-4 h-4" />
            </button>
          )}
          {canManageBroadcasts && (
            <button
              onClick={onOpenNewBroadcast}
              title={t("new_broadcast_list")}
              className={clsx(
                "p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                hoverBg,
                textTertiary,
              )}
            >
              <Megaphone className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Global Search Bar + Filters */}
      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <Search
            className={clsx(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
              textTertiary,
            )}
          />
          <input
            type="text"
            placeholder={t("search_messages_or_files")}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className={clsx(
              "w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all duration-200",
              inputClasses,
            )}
          />
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onToggleFilterPopover}
            title={t("filters")}
            className={clsx(
              "relative p-2.5 rounded-xl border cursor-pointer transition-all duration-200",
              borderColor,
              appliedFilterCount > 0
                ? isDark
                  ? "bg-teal-900/30 text-teal-400 border-teal-700"
                  : "bg-teal-50 text-teal-700 border-teal-300"
                : clsx(hoverBg, textTertiary),
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {appliedFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-bold">
                {appliedFilterCount}
              </span>
            )}
          </button>

          {showFilterPopover && (
            <ChatUsersFilterPopover
              filters={chatUsersFilters}
              onChange={onChatUsersFiltersChange}
              onClose={onCloseFilterPopover}
              lockDmo={lockDmo}
              lockAuthority={lockAuthority}
            />
          )}
        </div>
      </div>

      {/* Conversation-type pill filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar -mx-1 px-1">
        {typePills.map(({ key, label, icon: PillIcon }) => {
          const active = typeFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTypeFilterChange(key)}
              className={clsx(
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200",
                active
                  ? isDark
                    ? "bg-teal-900/30 text-teal-400 border-teal-700"
                    : "bg-teal-50 text-teal-700 border-teal-300"
                  : clsx(borderColor, hoverBg, textSecondary),
              )}
            >
              {PillIcon && <PillIcon className="w-3.5 h-3.5" />}
              {label}
              <span
                className={clsx(
                  "text-[10px] font-bold",
                  active
                    ? isDark
                      ? "text-teal-400/70"
                      : "text-teal-700/70"
                    : textTertiary,
                )}
              >
                {conversationTypeCounts[key]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
