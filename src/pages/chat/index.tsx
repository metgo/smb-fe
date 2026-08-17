import clsx from "clsx";
import i18n from "@/i18n";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { useAppSelector } from "@/hooks/hooks";
import { getApiErrorMessage } from "@/helpers";
import { ChatUsersList } from "./components/ChatUsersList";
import {
  NewDmModal,
  NewGroupModal,
  NewBroadcastModal,
} from "./components/modals";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatPresence } from "@/hooks/useChatPresence";
import { useSocket } from "@/providers/SocketProvider";
import {
  useChatUsersQuery,
  useChatConversationsQuery,
  useCreateGroupMutation,
  useBroadcastListsQuery,
} from "@/store/api/chatSystemApi";
import { ChatWindow } from "./components/chat-window";

const mapConversation = (c: IChatConversation): IConversation => ({
  id: c._id,
  type: c.type,
  name:
    c.type === "dm"
      ? c.otherParticipant?.name || i18n.t("user_fallback", { ns: "chat" })
      : c.name || "",
  avatar: c.avatar,
  members: c.otherParticipant ? [c.otherParticipant._id] : [],
  otherParticipant: c.otherParticipant,
  lastMessage: c.lastMessagePreview
    ? {
        id: `${c._id}-last`,
        senderId: "",
        senderName: "",
        text: c.lastMessagePreview,
        timestamp: c.lastMessageAt,
        readBy: [],
      }
    : undefined,
  mutedBy: c.isMuted ? ["me"] : [],
  archivedBy: c.isArchived ? ["me"] : [],
  unreadCount: c.unreadCount,
});

// Broadcast lists are a distinct concept from real conversations (no shared
// thread — see FE integration guide), but the sidebar/ChatWindow shell only
// knows how to select/render IConversation entries. Reusing the otherwise-
// unused "broadcast" conversation type lets a list slot into that flow with
// zero extra plumbing: ChatUsersList already badges it, and ChatWindow
// already branches on it to show the send-history/composer view instead of
// a message thread.
const mapBroadcastListToConversation = (
  b: IChatBroadcastListSummary,
): IConversation => ({
  id: b._id,
  type: "broadcast",
  name: b.name,
  description: b.description || undefined,
  members: [],
  creatorId: b.createdById,
});

export default function ChatPage() {
  const { t } = useTranslation("chat");
  const { bgSecondary, textPrimary, textTertiary } = useThemeClasses();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: chatUsers } = useChatUsersQuery({
    page: 1,
    limit: 200,
  });
  const chatUsersList = Array.isArray(chatUsers)
    ? chatUsers
    : chatUsers?.data || [];

  const socket = useSocket();

  // The logged-in user, mapped from Redux auth state into the IChatUser
  // shape the rest of the chat feature expects.
  const authUser = useAppSelector((state) => state.auth.user);
  const currentUser: IChatUser | null = useMemo(() => {
    if (!authUser) return null;
    return {
      _id: authUser.id,
      name: `${authUser.firstName} ${authUser.lastName}`.trim(),
      email: authUser.email,
      role: authUser.role as TUserRole,
      dmoId: authUser.dmo?.id,
      authorityId: authUser.authority?.id,
    };
  }, [authUser]);

  // Core Chat State
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // Navigation for mobile responsive view
  const [showInbox, setShowInbox] = useState(true);

  // Desktop sidebar collapse state (no toggle control currently exposed)
  const sidebarCollapsed = false;

  // Search Highlight Message (Story 8)
  const [highlightMessageId, setHighlightMessageId] = useState<
    string | undefined
  >(undefined);

  // Modals Visibility
  const [modalOpen, setModalOpen] = useState<{
    newDm: boolean;
    newGroup: boolean;
    newBroadcast: boolean;
    silence: boolean;
    settings: boolean;
  }>({
    newDm: false,
    newGroup: false,
    newBroadcast: false,
    silence: false,
    settings: false,
  });

  // Reset chat navigation state when the logged-in user changes
  useEffect(() => {
    setActiveConversationId(null);
    setShowInbox(true);
  }, [currentUser?._id]);

  // Real conversation list (inbox) from the backend
  const { data: conversationsRes, refetch: refetchConversations } =
    useChatConversationsQuery(
      { page: 1, limit: 50, includeArchived: true },
      { skip: !currentUser },
    );

  // Broadcast lists the current user owns (or, for SUPERADMIN, every list) —
  // merged into the conversation list below so they're selectable the same
  // way a DM/Group is. TRAVELLER gets a 403 on this endpoint, so skip it.
  const canManageBroadcasts =
    !!currentUser &&
    ["superadmin", "dmo", "authority"].includes(currentUser.role);
  const { data: broadcastListsRes, refetch: refetchBroadcastLists } =
    useBroadcastListsQuery(
      { page: 1, limit: 50 },
      { skip: !currentUser || !canManageBroadcasts },
    );

  const [createGroup] = useCreateGroupMutation();

  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    const mapped = (conversationsRes?.data || []).map(mapConversation);
    const broadcastConversations = (broadcastListsRes?.data || []).map(
      mapBroadcastListToConversation,
    );
    setConversations([...mapped, ...broadcastConversations]);
  }, [currentUser, conversationsRes, broadcastListsRes]);

  // Online status for every user we could have a DM with (conversation
  // peers + not-yet-messaged contacts) — kept live via the socket.
  const presenceUserIds = useMemo(() => {
    const ids = conversations
      .filter((c) => c.type === "dm")
      .map((c) => c.members[0])
      .concat(chatUsersList.map((u: IChatUser) => u._id));
    return ids.filter((id): id is string => !!id);
  }, [conversations, chatUsersList]);
  const presence = useChatPresence(presenceUserIds);

  // Refresh inbox on any relevant real-time chat event
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      refetchConversations();
    };

    socket.on("chat:message", handleUpdate);
    socket.on("chat:message-edited", handleUpdate);
    socket.on("chat:message-deleted", handleUpdate);
    socket.on("chat:read", handleUpdate);
    // A group was created (initial members) or the current user was just
    // added to an existing group — refetch the inbox to pick it up.
    socket.on("chat:conversation-updated", handleUpdate);

    return () => {
      socket.off("chat:message", handleUpdate);
      socket.off("chat:message-edited", handleUpdate);
      socket.off("chat:message-deleted", handleUpdate);
      socket.off("chat:read", handleUpdate);
      socket.off("chat:conversation-updated", handleUpdate);
    };
  }, [socket, refetchConversations]);

  // The current user was removed from a group by an admin — they're no
  // longer a participant, so drop it from the inbox and close it if open.
  useEffect(() => {
    if (!socket) return;

    const handleRemovedFromGroup = (
      payload: IChatSocketRemovedFromGroupPayload,
    ) => {
      setConversations((prev) =>
        prev.filter((c) => c.id !== payload.conversationId),
      );
      setActiveConversationId((prev) =>
        prev === payload.conversationId ? null : prev,
      );
    };

    socket.on("chat:removed-from-group", handleRemovedFromGroup);
    return () => {
      socket.off("chat:removed-from-group", handleRemovedFromGroup);
    };
  }, [socket]);

  // Handle select conversation
  const handleSelectConversation = (id: string, highlightMsgId?: string) => {
    setActiveConversationId(id);
    setHighlightMessageId(highlightMsgId);
    setShowInbox(false); // hide inbox on mobile view to show chat window
  };

  // Deep-link support: opening /chat?conversationId=<id> (e.g. from the
  // header chat notification bell) selects that conversation directly
  // instead of landing on the empty inbox state.
  useEffect(() => {
    const conversationId = searchParams.get("conversationId");
    if (!conversationId || !currentUser) return;
    handleSelectConversation(conversationId);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("conversationId");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUser]);

  // Start (or resume) a direct message thread. If a real conversation with
  // this user already exists, open it; otherwise open a pending/local DM
  // shell — the real conversation is created server-side on first send.
  const handleStartDm = (recipientId: string) => {
    const existing = conversations.find(
      (c) => c.type === "dm" && c.members.includes(recipientId),
    );
    if (existing) {
      handleSelectConversation(existing.id);
      return;
    }

    const recipient = chatUsersList.find(
      (u: IChatUser) => u._id === recipientId,
    );
    const pendingId = `pending-dm-${recipientId}`;
    setConversations((prev) => {
      if (prev.some((c) => c.id === pendingId)) return prev;
      return [
        ...prev,
        {
          id: pendingId,
          type: "dm",
          name: recipient?.name || t("user_fallback"),
          members: [recipientId],
        } as IConversation,
      ];
    });
    handleSelectConversation(pendingId);
  };

  // Called by ChatWindow after the first message in a pending DM succeeds,
  // so the pending shell can be swapped for the real conversation id.
  const handlePendingDmResolved = useCallback(
    (pendingId: string, realConversationId: string) => {
      setActiveConversationId((prev) =>
        prev === pendingId ? realConversationId : prev,
      );
      refetchConversations();
    },
    [refetchConversations],
  );

  // Create group chat
  const handleGroupCreated = async (
    groupName: string,
    description: string,
    memberIds: string[],
  ) => {
    try {
      const group = await createGroup({
        name: groupName,
        description: description || undefined,
        memberIds,
      }).unwrap();
      await refetchConversations();
      handleSelectConversation(group._id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("failed_to_create_group")));
    }
  };

  // A broadcast list was created — refresh the list and open it like any
  // other conversation, right in the ChatWindow.
  const handleBroadcastCreated = async (broadcastList: IChatBroadcastList) => {
    await refetchBroadcastLists();
    handleSelectConversation(broadcastList._id);
  };

  return (
    <div className={clsx("flex flex-col h-[88vh] select-none", bgSecondary)}>
      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Chat users list */}
        <div
          className={`${showInbox ? "flex" : "hidden md:flex"} h-full shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-0 md:w-16" : "w-full md:w-80 lg:w-96"} overflow-hidden`}
        >
          <ChatUsersList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            currentUser={currentUser}
            presence={presence}
            onStartDm={handleStartDm}
            onOpenNewDm={() => setModalOpen({ ...modalOpen, newDm: true })}
            onOpenNewGroup={() =>
              setModalOpen({ ...modalOpen, newGroup: true })
            }
            onOpenNewBroadcast={() =>
              setModalOpen({ ...modalOpen, newBroadcast: true })
            }
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Dynamic Workspace Panel (Chat window / Admin Views / Settings) */}
        <div
          className={`flex-1 flex flex-col h-full ${showInbox ? "hidden md:flex" : "flex"} transition-all duration-300`}
        >
          {/* Active Pane Render */}
          <div className="flex-1 min-h-0 relative">
            {activeConversationId ? (
              <ChatWindow
                conversationId={activeConversationId}
                currentUser={currentUser}
                highlightMessageId={highlightMessageId}
                onBack={() => setShowInbox(true)}
                chatUsers={chatUsersList}
                presence={presence}
                conversation={conversations.find(
                  (c) => c.id === activeConversationId,
                )}
                pendingDmRecipientId={
                  activeConversationId.startsWith("pending-dm-")
                    ? activeConversationId.replace("pending-dm-", "")
                    : undefined
                }
                onPendingDmResolved={handlePendingDmResolved}
                onGroupLeft={() => {
                  setActiveConversationId(null);
                  refetchConversations();
                  refetchBroadcastLists();
                }}
              />
            ) : (
              <div
                className={clsx(
                  "flex flex-col items-center justify-center h-full p-6 text-center select-none",
                  bgSecondary,
                )}
              >
                <AlertTriangle className="w-12 h-12 text-teal-500 mb-4" />
                <h3 className={clsx("text-base font-semibold", textPrimary)}>
                  {t("no_chat_selected")}
                </h3>
                <p className={clsx("text-xs max-w-sm mt-1", textTertiary)}>
                  {t("no_chat_selected_desc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals injection */}
      <NewDmModal
        isOpen={modalOpen.newDm}
        onClose={() => setModalOpen({ ...modalOpen, newDm: false })}
        currentUser={currentUser}
        onStartChat={handleStartDm}
        chatUsers={chatUsersList}
        conversations={conversations}
      />
      <NewGroupModal
        isOpen={modalOpen.newGroup}
        onClose={() => setModalOpen({ ...modalOpen, newGroup: false })}
        currentUser={currentUser}
        onGroupCreated={handleGroupCreated}
        chatUsers={chatUsersList}
      />
      <NewBroadcastModal
        isOpen={modalOpen.newBroadcast}
        onClose={() => setModalOpen({ ...modalOpen, newBroadcast: false })}
        currentUser={currentUser}
        chatUsers={chatUsersList}
        onBroadcastCreated={handleBroadcastCreated}
      />
      {/* <SilenceUserModal
        isOpen={modalOpen.silence}
        onClose={() => setModalOpen({ ...modalOpen, silence: false })}
        onSilence={handleSilenceUser}
        chatUsers={chatUsersList}
      /> */}
    </div>
  );
}
