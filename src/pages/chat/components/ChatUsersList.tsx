import clsx from "clsx";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Users,
  Megaphone,
  Search,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Mail,
  Info,
  Crown,
  Landmark,
  MapPin,
  Backpack,
  type LucideIcon,
} from "lucide-react";

import { getInitials, timeAgo } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useChatUsersQuery,
  useUpdateConversationSettingsMutation,
} from "@/store/api/chatSystemApi";
import ChatUserProfile from "./ChatUserProfile";
import {
  ChatUsersFilterPopover,
  EMPTY_CHAT_USERS_FILTERS,
  countAppliedChatUsersFilters,
  type ChatUsersFilters,
} from "./ChatUsersFilterPopover";

const ChatUserRowSkeleton = ({
  borderColor,
  isDark,
}: {
  borderColor: string;
  isDark: boolean;
}) => (
  <div className="px-4 py-3 flex items-center gap-3 animate-pulse">
    <div
      className={clsx(
        "w-8 h-8 rounded-full border shrink-0",
        borderColor,
        isDark ? "bg-gray-800" : "bg-gray-200",
      )}
    />
    <div className="flex-1 min-w-0 space-y-2">
      <div
        className={clsx(
          "h-3 rounded-full w-2/5",
          isDark ? "bg-gray-800" : "bg-gray-200",
        )}
      />
      <div
        className={clsx(
          "h-2.5 rounded-full w-3/5",
          isDark ? "bg-gray-800" : "bg-gray-200",
        )}
      />
    </div>
  </div>
);

interface ChatUsersListProps {
  conversations: IConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string, highlightMessageId?: string) => void;
  currentUser: IChatUser | null;
  presence?: Record<string, IPresenceEntry>;
  onStartDm?: (recipientId: string) => void;
  onOpenNewDm: () => void;
  onOpenNewGroup: () => void;
  onOpenNewBroadcast: () => void;
  collapsed?: boolean;
}

export const ChatUsersList: React.FC<ChatUsersListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUser,
  presence = {},
  onStartDm,
  onOpenNewDm,
  onOpenNewGroup,
  onOpenNewBroadcast,
  collapsed = false,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    inputClasses,
  } = useThemeClasses();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  // Conversation-type pill filter — All / Direct Messages / Groups /
  // Broadcasts — shown above the conversation list.
  const [typeFilter, setTypeFilter] = useState<
    "all" | "dm" | "group" | "broadcast"
  >("all");

  // DMO/Authority users are locked into their own org: default (and lock)
  // the corresponding filter(s) to their own dmoId/authorityId.
  const lockDmo =
    currentUser?.role === "dmo" || currentUser?.role === "authority";
  const lockAuthority = currentUser?.role === "authority";

  const [chatUsersFilters, setChatUsersFilters] = useState<ChatUsersFilters>(
    () => ({
      ...EMPTY_CHAT_USERS_FILTERS,
      dmoId: lockDmo ? currentUser?.dmoId || "" : "",
      authorityId: lockAuthority ? currentUser?.authorityId || "" : "",
    }),
  );
  const appliedFilterCount = countAppliedChatUsersFilters(chatUsersFilters, {
    lockDmo,
    lockAuthority,
  });

  // Debounce free-text search before it hits the API
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const { data: chatUsersRes, isFetching: isChatUsersFetching } =
    useChatUsersQuery({
      page: 1,
      limit: 200,
      search:
        debouncedSearchQuery.trim().length >= 2
          ? debouncedSearchQuery.trim()
          : undefined,
      dmoId: chatUsersFilters.dmoId || undefined,
      authorityId: chatUsersFilters.authorityId || undefined,
      role: chatUsersFilters.role ? [chatUsersFilters.role] : undefined,
    });
  const chatUsers: IChatUser[] = Array.isArray(chatUsersRes)
    ? chatUsersRes
    : chatUsersRes?.data || [];

  const [updateConversationSettings] = useUpdateConversationSettingsMutation();

  // Handle right-click context menu for muting conversations
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    convId: string;
  } | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Pending DM shells are created as soon as a contact is clicked, before
  // any message is actually sent — keep them out of the conversation list
  // until they've started a real chat (first message sent).
  const startedConversations = conversations.filter(
    (c) => !(c.id.startsWith("pending-dm-") && !c.lastMessage),
  );

  // Per-type counts for the pill filter badges, computed before the type
  // filter itself is applied so every pill always shows its true count.
  const conversationTypeCounts = {
    all: startedConversations.length,
    dm: startedConversations.filter((c) => c.type === "dm").length,
    group: startedConversations.filter((c) => c.type === "group").length,
    broadcast: startedConversations.filter((c) => c.type === "broadcast")
      .length,
  };

  // Client-side filter over the already-loaded conversation list (no
  // dedicated message-search endpoint exists in the DM API). DMO/Authority/
  // Role filters and free-text search are applied server-side via
  // useChatUsersQuery above, so a DM conversation is kept only if its other
  // participant is present in that already-filtered chatUsers list.
  const filteredConversations = startedConversations.filter((conv) => {
    if (typeFilter !== "all" && conv.type !== typeFilter) return false;
    if (conv.type !== "dm") return true;
    if (appliedFilterCount === 0 && debouncedSearchQuery.trim().length < 2) {
      return true;
    }
    const otherId = conv.otherParticipant?._id || conv.members[0];
    return chatUsers.some((u) => u._id === otherId);
  });

  // Users who don't yet have a DM conversation with the current user —
  // shown as a "Contacts" list; clicking one starts/opens the DM.
  const dmMemberIds = new Set(
    startedConversations
      .filter((c) => c.type === "dm")
      .flatMap((c) => c.members),
  );
  const usersWithoutConversation = chatUsers.filter((u) => {
    if (u._id === currentUser?._id) return false;
    if (dmMemberIds.has(u._id)) return false;
    return true;
  });

  const handleRightClick = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      convId,
    });
  };

  const handleToggleMute = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    setContextMenu(null);
    // Broadcast lists have no conversation-settings endpoint (no shared
    // thread to mute/archive) — mute is a DM/Group-only action.
    if (!conv || conv.type === "broadcast" || convId.startsWith("pending-dm-"))
      return;

    try {
      await updateConversationSettings({
        conversationId: convId,
        isMuted: !isMuted(conv),
      }).unwrap();
    } catch {
      toast.error(t("failed_to_update_conversation_settings"));
    }
  };

  const isMuted = (conv: IConversation) => {
    return !!currentUser && !!conv.mutedBy?.length;
  };

  // Helper to format timestamps nicely
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUnreadCount = (conv: IConversation): number => conv.unreadCount || 0;

  const onlineCount = Object.values(presence).filter(
    (entry) => entry.isOnline,
  ).length;

  // Users currently online, for the horizontal "active now" strip
  const onlineUsers = chatUsers.filter(
    (u) => u._id !== currentUser?._id && presence[u._id]?.isOnline,
  );

  // "Online" / "Last seen <relative time>" / nothing (never connected)
  const getPresenceLabel = (userId?: string): string | null => {
    if (!userId) return null;
    const entry = presence[userId];
    if (!entry) return null;
    if (entry.isOnline) return t("online_status");
    if (!entry.lastActiveAt) return null;
    return t("last_seen", { time: timeAgo(entry.lastActiveAt) });
  };

  // Role-specific pill colors for the Contacts list
  const roleBadgeClasses: Record<TUserRole, string> = {
    superadmin: isDark
      ? "bg-purple-900/30 text-purple-400"
      : "bg-purple-50 text-purple-700",
    authority: isDark
      ? "bg-amber-900/30 text-amber-400"
      : "bg-amber-50 text-amber-700",
    dmo: isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-50 text-teal-700",
    traveller: isDark
      ? "bg-gray-800 text-gray-300"
      : "bg-gray-100 text-gray-600",
  };

  // Role-specific icon shown alongside the role label/pill
  const roleIcons: Record<TUserRole, LucideIcon> = {
    superadmin: Crown,
    authority: Landmark,
    dmo: MapPin,
    traveller: Backpack,
  };

  // Determine permissions for buttons
  const canCreateGroup =
    currentUser &&
    ["superadmin", "dmo", "authority"].includes(currentUser.role);
  // Broadcast lists: SUPERADMIN/DMO/AUTHORITY can manage; TRAVELLER is
  // blocked from every broadcast endpoint (403) and never sees the entry.
  // Existing lists are merged into `conversations` by the parent (chat/
  // index.tsx) and render inline in the list below via their "broadcast"
  // badge — no separate section/query needed here.
  const canManageBroadcasts = canCreateGroup;

  return (
    <div
      className={clsx(
        "border-r flex flex-col h-full shrink-0 relative select-none transition-all duration-300",
        borderColor,
        bgPrimary,
        collapsed ? "w-16" : "w-full md:w-80 lg:w-96",
      )}
    >
      {collapsed ? (
        /* Collapsed state - show only icons */
        <div className="flex flex-col items-center h-full py-4 gap-4">
          <button
            onClick={onOpenNewDm}
            title={t("new_dm")}
            className={clsx(
              "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
            )}
          >
            <Mail className="w-5 h-5" />
          </button>
          {canCreateGroup && (
            <button
              onClick={onOpenNewGroup}
              title={t("new_group_chat")}
              className={clsx(
                "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                hoverBg,
              )}
            >
              <Users className="w-5 h-5" />
            </button>
          )}
          {canManageBroadcasts && (
            <button
              onClick={onOpenNewBroadcast}
              title={t("new_broadcast_list")}
              className={clsx(
                "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                hoverBg,
              )}
            >
              <Megaphone className="w-5 h-5" />
            </button>
          )}

          {currentUser && (
            <button
              type="button"
              onClick={() => setProfileEmail(currentUser.email)}
              title={currentUser.name}
              className={clsx(
                "mt-auto w-10 h-10 rounded-full border shrink-0 flex items-center justify-center font-bold text-sm cursor-pointer",
                borderColor,
                isDark
                  ? "bg-gray-800 text-gray-200"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {getInitials(currentUser.name)}
            </button>
          )}
        </div>
      ) : (
        /* Expanded state - show full interface */
        <>
          {/* Top search & title */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={clsx(
                    "w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all duration-200",
                    inputClasses,
                  )}
                />
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFilterPopover((v) => !v)}
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
                    onChange={setChatUsersFilters}
                    onClose={() => setShowFilterPopover(false)}
                    lockDmo={lockDmo}
                    lockAuthority={lockAuthority}
                  />
                )}
              </div>
            </div>

            {/* Conversation-type pill filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar -mx-1 px-1">
              {(
                [
                  { key: "all", label: t("all"), icon: null },
                  {
                    key: "dm",
                    label: t("direct_messages"),
                    icon: Mail,
                  },
                  { key: "group", label: t("groups"), icon: Users },
                  {
                    key: "broadcast",
                    label: t("broadcasts"),
                    icon: Megaphone,
                  },
                ] as const
              ).map(({ key, label, icon: PillIcon }) => {
                const active = typeFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTypeFilter(key)}
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

          {/* Active Now — horizontal scroll of currently-online users */}
          {onlineUsers.length > 0 && (
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
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <p
              className={clsx(
                "text-[11px] font-semibold uppercase tracking-wider mt-3",
                textTertiary,
              )}
            >
              {t("conversation_count", {
                count: filteredConversations.length,
              })}
            </p>

            {filteredConversations?.length > 0 ? (
              filteredConversations?.map((conv) => {
                const active = conv.id === activeConversationId;
                const unreadCount = getUnreadCount(conv);

                let previewText = conv.lastMessage
                  ? conv.lastMessage.isSystem
                    ? conv.lastMessage.text
                    : conv.lastMessage.text
                  : "";

                if (conv.lastMessage?.isDeleted) {
                  previewText = t("message_removed_by_admin");
                }

                // Truncate at 50 characters (Story 1)
                if (previewText.length > 50) {
                  previewText = previewText.substring(0, 50) + "...";
                }

                // Determine correct visual styling for broadcast/group rows
                const isBroadcast = conv.type === "broadcast";
                const isGroup = conv.type === "group";

                // For DMs, resolve the other participant to show their role pill.
                // Prefer the conversation's own otherParticipant (always present
                // for DMs from the API) over the paginated chatUsers list, which
                // may not include every user the current account has a DM with.
                const dmUser =
                  conv.type === "dm"
                    ? conv.otherParticipant ||
                      chatUsers.find((u) => u._id === conv.members[0])
                    : undefined;

                return (
                  <div
                    key={conv.id}
                    onContextMenu={(e) =>
                      conv.type !== "broadcast" && handleRightClick(e, conv.id)
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
                          isDark
                            ? "bg-gray-800 text-gray-200"
                            : "bg-gray-100 text-gray-600",
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
                              const RoleIcon = roleIcons[dmUser.role];
                              return (
                                <span
                                  className={clsx(
                                    "px-2 py-0.5 text-[9px] font-bold rounded-full capitalize shrink-0 flex items-center gap-1",
                                    roleBadgeClasses[dmUser.role],
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
                        <span
                          className={clsx("text-[10px] shrink-0", textTertiary)}
                        >
                          {conv.lastMessage
                            ? formatTime(conv.lastMessage.timestamp)
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5 gap-2">
                        <p
                          className={clsx(
                            "text-xs truncate flex-1",
                            unreadCount > 0
                              ? clsx("font-bold", textPrimary)
                              : textSecondary,
                          )}
                        >
                          {previewText ||
                            (dmUser && getPresenceLabel(dmUser._id) ? (
                              <span
                                className={clsx(
                                  presence[dmUser._id]?.isOnline
                                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                    : textTertiary,
                                )}
                              >
                                {getPresenceLabel(dmUser._id)}
                              </span>
                            ) : (
                              <span className={clsx("italic", textTertiary)}>
                                {t("no_messages_yet")}
                              </span>
                            ))}
                        </p>
                        <div className="flex items-center gap-1">
                          {dmUser?.email && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProfileEmail(dmUser.email);
                              }}
                              title={t("view_profile")}
                              className={clsx(
                                "p-0.5 rounded-full cursor-pointer transition-colors shrink-0",
                                textTertiary,
                                isDark
                                  ? "hover:text-teal-400"
                                  : "hover:text-teal-600",
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
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
                <MessageSquare
                  className={clsx("w-10 h-10 mb-2", textTertiary)}
                />
                <p className={clsx("text-sm font-medium", textSecondary)}>
                  {t("no_conversations_yet")}
                </p>
                <button
                  onClick={onOpenNewDm}
                  className="mt-3 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t("start_conversation")}
                </button>
              </div>
            )}

            {/* Contacts without an existing conversation — only relevant
                when browsing DMs (they exist purely to start one). */}
            {(typeFilter === "all" || typeFilter === "dm") && (
              <>
                {isChatUsersFetching ? (
                  <div className={clsx("border-t pt-2 pb-1", borderColor)}>
                    <p
                      className={clsx(
                        "text-[11px] font-semibold uppercase tracking-wider px-4 pb-1",
                        textTertiary,
                      )}
                    >
                      {t("contacts")}
                    </p>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <ChatUserRowSkeleton
                        key={i}
                        borderColor={borderColor}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                ) : (
                  usersWithoutConversation.length > 0 && (
                    <div className={clsx("border-t pt-2 pb-1", borderColor)}>
                      <p
                        className={clsx(
                          "text-[11px] font-semibold uppercase tracking-wider px-4 pb-1",
                          textTertiary,
                        )}
                      >
                        {t("contacts_count", {
                          count: usersWithoutConversation.length,
                        })}
                      </p>
                      {usersWithoutConversation.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => onStartDm?.(user._id)}
                          className={clsx(
                            "w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 select-none cursor-pointer",
                            hoverBg,
                          )}
                        >
                          <div className="relative shrink-0">
                            <div
                              className={clsx(
                                "w-8 h-8 rounded-full border shrink-0 flex items-center justify-center font-bold text-sm",
                                borderColor,
                                isDark
                                  ? "bg-gray-800 text-gray-200"
                                  : "bg-gray-100 text-gray-600",
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
                              <p
                                className={clsx(
                                  "text-sm font-bold truncate",
                                  textPrimary,
                                )}
                              >
                                {user.name}
                              </p>
                              {(() => {
                                const RoleIcon = roleIcons[user.role];
                                return (
                                  <span
                                    className={clsx(
                                      "px-2 py-0.5 text-xs font-semibold rounded-full capitalize shrink-0 flex items-center gap-1",
                                      roleBadgeClasses[user.role],
                                    )}
                                  >
                                    <RoleIcon className="w-3 h-3" />
                                    {user.role}
                                  </span>
                                );
                              })()}
                            </div>
                            <p
                              className={clsx(
                                "text-xs truncate",
                                textSecondary,
                              )}
                            >
                              {getPresenceLabel(user._id) || user.email}
                            </p>
                          </div>
                          {user.email && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProfileEmail(user.email);
                              }}
                              title={t("view_profile")}
                              className={clsx(
                                "p-1.5 rounded-full cursor-pointer transition-colors shrink-0",
                                textTertiary,
                                isDark
                                  ? "hover:text-teal-400"
                                  : "hover:text-teal-600",
                              )}
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>

          {/* Logged-in user — fixed at the bottom of the sidebar */}
          {currentUser && (
            <div
              className={clsx(
                "shrink-0 border-t p-3 flex items-center gap-3",
                borderColor,
              )}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-full border border-green-500 shrink-0 flex items-center justify-center font-bold text-sm",
                  isDark
                    ? "bg-gray-800 text-gray-200"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {getInitials(currentUser.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx("text-sm font-bold truncate", textPrimary)}>
                  {currentUser.name}
                </p>
                {(() => {
                  const RoleIcon = roleIcons[currentUser.role];
                  return (
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize",
                        roleBadgeClasses[currentUser.role],
                      )}
                    >
                      <RoleIcon className="w-2.5 h-2.5" />
                      {currentUser.role}
                    </span>
                  );
                })()}
              </div>
              <button
                type="button"
                onClick={() => setProfileEmail(currentUser.email)}
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
          )}

          {/* Right-click Mute/Unmute Context Menu */}
          {contextMenu && (
            <div
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className={clsx(
                "fixed z-50 border rounded-lg shadow-lg py-1 min-w-30",
                bgPrimary,
                borderColor,
              )}
            >
              <button
                onClick={() => handleToggleMute(contextMenu.convId)}
                className={clsx(
                  "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors",
                  textSecondary,
                  hoverBg,
                )}
              >
                {(() => {
                  const menuConv = conversations.find(
                    (c) => c.id === contextMenu.convId,
                  );
                  return menuConv && isMuted(menuConv);
                })() ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    {t("unmute_chat")}
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-destructive" />
                    {t("mute_chat")}
                  </>
                )}
              </button>
            </div>
          )}

          {profileEmail && (
            <ChatUserProfile
              email={profileEmail}
              onClose={() => setProfileEmail(null)}
            />
          )}
        </>
      )}
    </div>
  );
};
