import clsx from "clsx";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { timeAgo } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useChatUsersQuery } from "@/store/api/chatSystemApi";
import ChatUserProfile from "./ChatUserProfile";
import {
  EMPTY_CHAT_USERS_FILTERS,
  countAppliedChatUsersFilters,
  type ChatUsersFilters,
} from "./ChatUsersFilterPopover";
import {
  CHAT_USERS_PAGE_LIMIT,
  ChatUsersCollapsedSidebar,
  ChatUsersListHeader,
  ChatActiveNowStrip,
  ChatConversationsSection,
  ChatContactsSection,
  ChatCurrentUserFooter,
} from "./sub-components";

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

  const [chatUsersPage, setChatUsersPage] = useState(1);
  const [chatUsers, setChatUsers] = useState<IChatUser[]>([]);

  // Reset pagination whenever the effective query (search/filters) changes
  useEffect(() => {
    setChatUsersPage(1);
  }, [
    debouncedSearchQuery,
    chatUsersFilters.dmoId,
    chatUsersFilters.authorityId,
    chatUsersFilters.role,
  ]);

  const {
    data: chatUsersRes,
    isFetching: isChatUsersFetching,
    isError: isChatUsersError,
  } = useChatUsersQuery({
    page: chatUsersPage,
    limit: CHAT_USERS_PAGE_LIMIT,
    search:
      debouncedSearchQuery.trim().length >= 2
        ? debouncedSearchQuery.trim()
        : undefined,
    dmoId: chatUsersFilters.dmoId || undefined,
    authorityId: chatUsersFilters.authorityId || undefined,
    role: chatUsersFilters.role ? chatUsersFilters.role : undefined,
  });

  useEffect(() => {
    const page = Array.isArray(chatUsersRes) ? 1 : chatUsersRes?.meta?.page;
    const newUsers = Array.isArray(chatUsersRes)
      ? chatUsersRes
      : chatUsersRes?.data || [];
    if (!chatUsersRes) return;

    if (!page || page === 1) {
      setChatUsers(newUsers);
    } else {
      setChatUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u._id));
        const uniqueNewUsers = newUsers.filter((u) => !existingIds.has(u._id));
        return [...prev, ...uniqueNewUsers];
      });
    }
  }, [chatUsersRes]);

  const hasMoreChatUsers =
    !isChatUsersError &&
    !Array.isArray(chatUsersRes) &&
    !!chatUsersRes?.meta?.hasNextPage;

  const fetchMoreChatUsers = () => {
    if (!hasMoreChatUsers || isChatUsersFetching) return;
    setChatUsersPage((prev) => prev + 1);
  };

  const listScrollRef = useRef<HTMLDivElement | null>(null);
  useInfiniteScroll({
    ref: listScrollRef,
    hasMore: hasMoreChatUsers,
    isLoading: isChatUsersFetching,
    onLoadMore: fetchMoreChatUsers,
  });

  // Handle right-click context menu for muting conversations
  const [_contextMenu, setContextMenu] = useState<{
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

  const onlineCount = Object.values(presence).filter(
    (entry) => entry.isOnline,
  ).length;

  // Users currently online, for the horizontal "active now" strip
  const onlineUsers = chatUsers.filter(
    (u) => u._id !== currentUser?._id && presence[u._id]?.isOnline,
  );

  // Determine permissions for buttons
  const canCreateGroup =
    !!currentUser &&
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
        <ChatUsersCollapsedSidebar
          currentUser={currentUser}
          canCreateGroup={canCreateGroup}
          canManageBroadcasts={canManageBroadcasts}
          onOpenNewDm={onOpenNewDm}
          onOpenNewGroup={onOpenNewGroup}
          onOpenNewBroadcast={onOpenNewBroadcast}
          onOpenProfile={setProfileEmail}
          t={t}
          isDark={isDark}
          borderColor={borderColor}
          hoverBg={hoverBg}
        />
      ) : (
        <>
          <ChatUsersListHeader
            canCreateGroup={canCreateGroup}
            canManageBroadcasts={canManageBroadcasts}
            onOpenNewDm={onOpenNewDm}
            onOpenNewGroup={onOpenNewGroup}
            onOpenNewBroadcast={onOpenNewBroadcast}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            showFilterPopover={showFilterPopover}
            onToggleFilterPopover={() => setShowFilterPopover((v) => !v)}
            onCloseFilterPopover={() => setShowFilterPopover(false)}
            chatUsersFilters={chatUsersFilters}
            onChatUsersFiltersChange={setChatUsersFilters}
            appliedFilterCount={appliedFilterCount}
            lockDmo={lockDmo}
            lockAuthority={lockAuthority}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            conversationTypeCounts={conversationTypeCounts}
          />

          {onlineUsers.length > 0 && (
            <ChatActiveNowStrip
              t={t}
              isDark={isDark}
              textSecondary={textSecondary}
              textTertiary={textTertiary}
              borderColor={borderColor}
              onlineUsers={onlineUsers}
              onlineCount={onlineCount}
              onStartDm={onStartDm}
            />
          )}

          {/* Conversations List */}
          <div
            ref={listScrollRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <ChatConversationsSection
              filteredConversations={filteredConversations}
              chatUsers={chatUsers}
              activeConversationId={activeConversationId}
              timeAgo={timeAgo}
              presence={presence}
              onSelectConversation={onSelectConversation}
              onContextMenu={handleRightClick}
              onOpenProfile={setProfileEmail}
              onOpenNewDm={onOpenNewDm}
            />

            {/* Contacts without an existing conversation — only relevant
                when browsing DMs (they exist purely to start one). */}
            <ChatContactsSection
              visible={typeFilter === "all" || typeFilter === "dm"}
              isChatUsersFetching={isChatUsersFetching}
              usersWithoutConversation={usersWithoutConversation}
              timeAgo={timeAgo}
              presence={presence}
              onStartDm={onStartDm}
              onOpenProfile={setProfileEmail}
            />
          </div>

          {currentUser && (
            <ChatCurrentUserFooter
              currentUser={currentUser}
              t={t}
              isDark={isDark}
              textPrimary={textPrimary}
              textTertiary={textTertiary}
              borderColor={borderColor}
              onOpenProfile={setProfileEmail}
            />
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
