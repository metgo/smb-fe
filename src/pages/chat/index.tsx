import clsx from "clsx";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

import { useAppSelector } from "@/hooks/hooks";
import { ChatUsersList } from "./components/ChatUsersList";
import { ChatWindow } from "./components/ChatWindow";
import {
  NewDmModal,
  NewGroupModal,
  NewBroadcastModal,
  SilenceUserModal,
} from "./components/modals";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatPresence } from "@/hooks/useChatPresence";
import { useSocket } from "@/providers/SocketProvider";
import {
  useChatUsersQuery,
  useChatConversationsQuery,
} from "@/store/api/chatSystemApi";

const mapConversation = (c: IChatConversation): IConversation => ({
  id: c._id,
  type: c.type,
  name: c.type === "dm" ? c.otherParticipant?.name || "User" : c.name || "",
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

export default function ChatPage() {
  const { authorityId, dmoId } = useAppSelector((state) => state.auth);
  const { bgSecondary, textPrimary, textTertiary } = useThemeClasses();

  const { data: chatUsers } = useChatUsersQuery({
    page: 1,
    limit: 200,
    authorityId,
    dmoId,
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

  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    const mapped = (conversationsRes?.data || []).map(mapConversation);
    setConversations(mapped);
  }, [currentUser, conversationsRes]);

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

    return () => {
      socket.off("chat:message", handleUpdate);
      socket.off("chat:message-edited", handleUpdate);
      socket.off("chat:message-deleted", handleUpdate);
      socket.off("chat:read", handleUpdate);
    };
  }, [socket, refetchConversations]);

  // Handle select conversation
  const handleSelectConversation = (id: string, highlightMsgId?: string) => {
    setActiveConversationId(id);
    setHighlightMessageId(highlightMsgId);
    setShowInbox(false); // hide inbox on mobile view to show chat window
  };

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
          name: recipient?.name || "User",
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
  const handleGroupCreated = () => {
    // No-op for now
  };

  // Create broadcast channel
  const handleBroadcastCreated = () => {
    // No-op for now
  };

  // Silence user globally
  const handleSilenceUser = () => {
    // No-op for now
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
            chatUsers={chatUsersList}
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
                  No Chat Selected
                </h3>
                <p className={clsx("text-xs max-w-sm mt-1", textTertiary)}>
                  Select a conversation from the inbox panel or trigger a direct
                  message from the action bar.
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
        onBroadcastCreated={handleBroadcastCreated}
      />
      <SilenceUserModal
        isOpen={modalOpen.silence}
        onClose={() => setModalOpen({ ...modalOpen, silence: false })}
        onSilence={handleSilenceUser}
        chatUsers={chatUsersList}
      />
    </div>
  );
}
