import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useCallback } from "react";

import { useSocket } from "@/providers/SocketProvider";
import { sanitizeMessageHtml } from "@/helpers";
import {
  useLazyFetchConversationMessagesQuery,
  useSendMessageMutation,
  useSendDirectMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useMarkConversationReadMutation,
  useGroupDetailsQuery,
} from "@/store/api/chatSystemApi";

const mapWireMessage = (
  m: IChatMessage,
  senderNameFor: (id: string) => string,
): IMessage => ({
  id: m._id,
  senderId: m.senderId,
  senderName: senderNameFor(m.senderId),
  text: m.content ?? "",
  timestamp: m.createdAt,
  readBy: [],
  isSystem: m.type === "system",
  isDeleted: !!m.deletedAt || m.content === null,
  edited: m.isEdited,
  editedAt: m.updatedAt,
});

// Typing a markdown-style formatting character or a leading "/" switches
// the composer into the rich text editor, mirroring Teams' behavior.
const RICH_TEXT_TRIGGER = /^\/|[*_`#>[\]-]/;

interface UseChatWindowProps {
  conversationId: string;
  currentUser: IChatUser | null;
  highlightMessageId?: string;
  conversation?: IConversation;
  chatUsers?: IChatUser[];
  pendingDmRecipientId?: string;
  onPendingDmResolved?: (pendingId: string, realConversationId: string) => void;
}

export const useChatWindow = ({
  conversationId,
  currentUser,
  highlightMessageId,
  conversation,
  chatUsers,
  pendingDmRecipientId,
  onPendingDmResolved,
}: UseChatWindowProps) => {
  const { t } = useTranslation("chat");
  const socket = useSocket();
  const isPendingDm = !!pendingDmRecipientId;
  // Broadcast lists have no conversation-messages thread of their own —
  // ChatWindow renders a dedicated send-history view for them instead
  // (useBroadcastWindow), so this hook must not hit the DM/Group message
  // endpoints for one.
  const isBroadcast = conversation?.type === "broadcast";

  const [fetchMessages] = useLazyFetchConversationMessagesQuery();
  const [sendMessageMutation] = useSendMessageMutation();
  const [sendDirectMessageMutation] = useSendDirectMessageMutation();
  const [editMessageMutation] = useEditMessageMutation();
  const [deleteMessageMutation] = useDeleteMessageMutation();
  const [markConversationRead] = useMarkConversationReadMutation();

  // chatUsers is scoped to the users this account is permitted to see
  // (e.g. by authority/dmo), which for non-superadmin roles can exclude
  // other members of a group they belong to. The group roster has no such
  // restriction, so it's used as a fallback source of truth for names.
  const { data: groupDetails } = useGroupDetailsQuery(conversationId, {
    skip: !conversationId || conversation?.type !== "group",
  });

  const senderNameFor = useCallback(
    (id: string) => {
      if (id === currentUser?._id) return currentUser?.name || t("you");
      return (
        chatUsers?.find((u) => u._id === id)?.name ||
        groupDetails?.participants.find((p) => p._id === id)?.name ||
        t("user_fallback")
      );
    },
    [chatUsers, currentUser, groupDetails, t],
  );

  // Message state
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [text, setText] = useState("");

  // Teams-style adaptive composer: plain textarea by default, switches to
  // the CKEditor rich text editor once the user types a formatting trigger.
  const [isRichMode, setIsRichMode] = useState(false);
  const [richHtml, setRichHtml] = useState("");

  // Attachments State
  const [attachments, setAttachments] = useState<IAttachment[]>([]);

  // Searching within the open conversation (Story 8)
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localSearchResults, setLocalSearchResults] = useState<string[]>([]); // message IDs that match
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  // Scroll variables
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBanner, setShowScrollBanner] = useState(false);
  const [showJumpButton, setShowJumpButton] = useState(false);

  // Context menus for message actions
  const [msgContextMenu, setMsgContextMenu] = useState<{
    x: number;
    y: number;
    message: IMessage;
  } | null>(null);
  const [editTargetMessage, setEditTargetMessage] = useState<IMessage | null>(
    null,
  );
  const [editText, setEditText] = useState("");

  // Typing indicators — real-time via the chat:typing socket event.
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const typingClearTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const ownTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isEmittingTypingRef = useRef(false);

  const notifyTyping = useCallback(() => {
    if (!socket || isPendingDm) return;

    if (!isEmittingTypingRef.current) {
      isEmittingTypingRef.current = true;
      socket.emit("chat:typing", { conversationId, isTyping: true });
    }

    if (ownTypingTimeoutRef.current) clearTimeout(ownTypingTimeoutRef.current);
    ownTypingTimeoutRef.current = setTimeout(() => {
      isEmittingTypingRef.current = false;
      socket.emit("chat:typing", { conversationId, isTyping: false });
    }, 3000);
  }, [socket, conversationId, isPendingDm]);

  // Called immediately on send — no reason to wait out the 3s timer once the
  // message is already gone.
  const stopTyping = useCallback(() => {
    if (!socket || isPendingDm) return;
    if (ownTypingTimeoutRef.current) {
      clearTimeout(ownTypingTimeoutRef.current);
      ownTypingTimeoutRef.current = null;
    }
    if (isEmittingTypingRef.current) {
      isEmittingTypingRef.current = false;
      socket.emit("chat:typing", { conversationId, isTyping: false });
    }
  }, [socket, conversationId, isPendingDm]);

  // Lightbox Image Viewer
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Fetch Conversation info
  // conversation is now passed as a prop from parent

  // Load message history (real conversations only; pending DMs and
  // broadcast lists start/stay empty — a broadcast list has no thread of
  // its own for this endpoint to return).
  const loadMessages = useCallback(async () => {
    if (isPendingDm || isBroadcast) {
      setMessages([]);
      setHasMoreMessages(false);
      return;
    }
    try {
      const res = await fetchMessages({ conversationId, limit: 30 }).unwrap();
      // API already returns oldest-first (index 0 = oldest, last = newest) —
      // no reverse needed.
      const mapped = res.data.map((m) => mapWireMessage(m, senderNameFor));
      setMessages(mapped);
      setHasMoreMessages(res.hasMore);
    } catch {
      setMessages([]);
      setHasMoreMessages(false);
      toast.error(t("failed_to_load_messages"));
    }
  }, [conversationId, isPendingDm, isBroadcast, fetchMessages, senderNameFor]);

  const loadOlderMessages = useCallback(async () => {
    if (isPendingDm || isBroadcast || !hasMoreMessages || messages.length === 0)
      return;
    const oldest = messages[0];
    try {
      const res = await fetchMessages({
        conversationId,
        before: oldest.id,
        limit: 30,
      }).unwrap();
      // Same as loadMessages — already oldest-first, no reverse needed.
      const mapped = res.data.map((m) => mapWireMessage(m, senderNameFor));
      setMessages((prev) => [...mapped, ...prev]);
      setHasMoreMessages(res.hasMore);
    } catch {
      toast.error(t("failed_to_load_older_messages"));
    }
  }, [
    conversationId,
    isPendingDm,
    isBroadcast,
    hasMoreMessages,
    messages,
    fetchMessages,
    senderNameFor,
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBanner(false);
  };

  useEffect(() => {
    loadMessages();
    setAttachments([]);
    setShowSearch(false);
    setLocalSearchQuery("");
    setText("");
    setRichHtml("");
    setIsRichMode(false);

    setTypingUserIds([]);
    Object.values(typingClearTimeoutsRef.current).forEach(clearTimeout);
    typingClearTimeoutsRef.current = {};
    if (ownTypingTimeoutRef.current) {
      clearTimeout(ownTypingTimeoutRef.current);
      ownTypingTimeoutRef.current = null;
    }
    isEmittingTypingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUser]);

  // Real-time message/edit/delete/read events from the socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: IChatSocketMessagePayload) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) => [
        ...prev,
        mapWireMessage(payload.message, senderNameFor),
      ]);

      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (isNearBottom) {
          setTimeout(scrollToBottom, 50);
        } else {
          setShowScrollBanner(true);
        }
      }
    };

    const handleMessageEdited = (payload: IChatSocketMessageEditedPayload) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? {
                ...m,
                text: payload.content,
                edited: payload.isEdited,
                editedAt: payload.updatedAt,
              }
            : m,
        ),
      );
    };

    const handleMessageDeleted = (
      payload: IChatSocketMessageDeletedPayload,
    ) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId ? { ...m, isDeleted: true, text: "" } : m,
        ),
      );
    };

    const handleRead = (payload: IChatSocketReadPayload) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.readBy.includes(payload.userId)
            ? m
            : { ...m, readBy: [...m.readBy, payload.userId] },
        ),
      );
    };

    const handleTyping = (payload: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (payload.conversationId !== conversationId) return;

      setTypingUserIds((prev) => {
        if (payload.isTyping) {
          return prev.includes(payload.userId)
            ? prev
            : [...prev, payload.userId];
        }
        return prev.filter((id) => id !== payload.userId);
      });

      if (typingClearTimeoutsRef.current[payload.userId]) {
        clearTimeout(typingClearTimeoutsRef.current[payload.userId]);
        delete typingClearTimeoutsRef.current[payload.userId];
      }

      if (payload.isTyping) {
        typingClearTimeoutsRef.current[payload.userId] = setTimeout(() => {
          setTypingUserIds((prev) =>
            prev.filter((id) => id !== payload.userId),
          );
          delete typingClearTimeoutsRef.current[payload.userId];
        }, 3000);
      }
    };

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:message-edited", handleMessageEdited);
    socket.on("chat:message-deleted", handleMessageDeleted);
    socket.on("chat:read", handleRead);
    socket.on("chat:typing", handleTyping);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:message-edited", handleMessageEdited);
      socket.off("chat:message-deleted", handleMessageDeleted);
      socket.off("chat:read", handleRead);
      socket.off("chat:typing", handleTyping);
    };
  }, [socket, conversationId, senderNameFor]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (isPendingDm || isBroadcast || !conversationId) return;
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId, isPendingDm, isBroadcast, markConversationRead]);

  // Highlight message from search result (Story 8)
  useEffect(() => {
    if (highlightMessageId && messages.length > 0) {
      const el = document.getElementById(`msg-${highlightMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add(
          "bg-teal-500/10",
          "dark:bg-teal-400/10",
          "border-teal-500/30",
        );
        setTimeout(() => {
          el.classList.remove(
            "bg-teal-500/10",
            "dark:bg-teal-400/10",
            "border-teal-500/30",
          );
        }, 3000);
      }
    } else {
      scrollToBottom();
    }
  }, [highlightMessageId, messages.length]);

  // Monitor scrolling for infinite scroll (loads older messages from the API) & jump button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Jump button visibility (if scrolled up more than 400px)
    setShowJumpButton(scrollHeight - scrollTop - clientHeight > 400);

    // Infinite scroll upward (lazy-load older messages from the server)
    if (scrollTop === 0 && hasMoreMessages) {
      const prevHeight = scrollHeight;
      loadOlderMessages().then(() => {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop =
              containerRef.current.scrollHeight - prevHeight;
          }
        }, 50);
      });
    }
  };

  // Local Search Highlight logic (Story 8)
  useEffect(() => {
    if (localSearchQuery.trim().length < 2) {
      setLocalSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const matchedIds = messages
      .filter(
        (m) =>
          !m.isSystem &&
          !m.isDeleted &&
          (m.text.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
            m.attachments?.some((a: IAttachment) =>
              a.name.toLowerCase().includes(localSearchQuery.toLowerCase()),
            )),
      )
      .map((m) => m.id);

    setLocalSearchResults(matchedIds);
    if (matchedIds.length > 0) {
      setCurrentSearchIndex(matchedIds.length - 1);
      // scroll to it
      const el = document.getElementById(
        `msg-${matchedIds[matchedIds.length - 1]}`,
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setCurrentSearchIndex(-1);
    }
  }, [localSearchQuery, messages]);

  const handleSearchNext = (dir: "prev" | "next") => {
    if (localSearchResults.length === 0) return;
    let nextIdx = currentSearchIndex;
    if (dir === "next") {
      nextIdx = (currentSearchIndex + 1) % localSearchResults.length;
    } else {
      nextIdx =
        (currentSearchIndex - 1 + localSearchResults.length) %
        localSearchResults.length;
    }
    setCurrentSearchIndex(nextIdx);
    const el = document.getElementById(`msg-${localSearchResults[nextIdx]}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Strips HTML down to plain text, e.g. for reply-preview snippets
  const getPlainTextFromHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || "").trim();
  };

  // Escapes plain text before seeding it as CKEditor's initial HTML
  const escapeHtml = (value: string) => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  };

  // Switches the plain textarea into the rich text editor once the user
  // types a markdown-style formatting character or a leading "/" (Teams-style)
  const handleTextChange = (value: string) => {
    setText(value);
    if (value) notifyTyping();
    if (!isRichMode && RICH_TEXT_TRIGGER.test(value)) {
      setIsRichMode(true);
      setRichHtml(`<p>${escapeHtml(value)}</p>`);
      setText("");
    }
  };

  const handleRichTextChange = (value: string) => {
    setRichHtml(value);
    if (getPlainTextFromHtml(value)) notifyTyping();
  };

  const handleToggleComposerMode = () => {
    if (isRichMode) {
      setText(getPlainTextFromHtml(richHtml));
      setRichHtml("");
      setIsRichMode(false);
    } else {
      setRichHtml(text ? `<p>${escapeHtml(text)}</p>` : "");
      setText("");
      setIsRichMode(true);
    }
  };

  // Send Message logic — optimistic UI update, rolled back on API error
  const handleSend = async () => {
    const plainFromRich = isRichMode ? getPlainTextFromHtml(richHtml) : "";
    const hasContent = isRichMode ? !!plainFromRich : !!text.trim();
    if (!hasContent) return;
    if (!currentUser) return;

    const content = isRichMode ? sanitizeMessageHtml(richHtml) : text.trim();
    const tempId = `temp-${Date.now()}`;

    stopTyping();

    const optimisticMsg: IMessage = {
      id: tempId,
      senderId: currentUser._id,
      senderName: currentUser.name || "User",
      senderRole: currentUser.role,
      text: content,
      isRichText: isRichMode,
      timestamp: new Date().toISOString(),
      readBy: [currentUser._id],
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    setRichHtml("");
    setIsRichMode(false);
    setAttachments([]);
    setTimeout(scrollToBottom, 50);

    try {
      if (isPendingDm && pendingDmRecipientId) {
        const res = await sendDirectMessageMutation({
          targetUserId: pendingDmRecipientId,
          content,
        }).unwrap();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? mapWireMessage(res.message, senderNameFor) : m,
          ),
        );
        onPendingDmResolved?.(conversationId, res.conversationId);
      } else {
        const res = await sendMessageMutation({
          conversationId,
          content,
        }).unwrap();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? mapWireMessage(res, senderNameFor) : m,
          ),
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error(t("failed_to_send_message"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Message Right Click context menu
  const handleMessageContextMenu = (e: React.MouseEvent, msg: IMessage) => {
    e.preventDefault();
    if (msg.isSystem) return;
    setMsgContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg,
    });
  };

  const isComposerDisabled = false;

  // Deletion logic — self-delete only, per the DM API guide
  const handleDeleteMessage = async (msg: IMessage) => {
    const isOwner = currentUser?._id === msg.senderId;
    setMsgContextMenu(null);
    if (!isOwner || isPendingDm) return;

    const prevMessages = messages;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, isDeleted: true, text: "" } : m,
      ),
    );

    try {
      await deleteMessageMutation({
        conversationId,
        messageId: msg.id,
      }).unwrap();
    } catch {
      setMessages(prevMessages);
      toast.error(t("failed_to_delete_message"));
    }
  };

  // Edit message logic - inline editing, self-edit only
  const handleEditMessage = (msg: IMessage) => {
    const isOwner = currentUser?._id === msg.senderId;
    if (isOwner && !msg.isSystem && !msg.isDeleted) {
      setEditTargetMessage(msg);
      setEditText(msg.isRichText ? msg.text : `<p>${escapeHtml(msg.text)}</p>`);
    }
    setMsgContextMenu(null);
  };

  const handleConfirmEdit = async () => {
    if (!editTargetMessage || !currentUser || isPendingDm) return;
    const newText = sanitizeMessageHtml(editText);
    if (!getPlainTextFromHtml(newText)) return;

    const targetId = editTargetMessage.id;
    setEditTargetMessage(null);
    setEditText("");

    try {
      const res = await editMessageMutation({
        conversationId,
        messageId: targetId,
        content: newText,
      }).unwrap();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === targetId
            ? {
                ...m,
                text: res.content ?? newText,
                isRichText: true,
                edited: true,
                editedAt: res.updatedAt,
              }
            : m,
        ),
      );
    } catch {
      toast.error(t("failed_to_edit_message"));
    }
  };

  const handleCancelEdit = () => {
    setEditTargetMessage(null);
    setEditText("");
  };

  const typingUsers = typingUserIds.map((id) => senderNameFor(id));

  return {
    // State
    messages,
    text,
    isRichMode,
    richHtml,
    attachments,
    showSearch,
    localSearchQuery,
    localSearchResults,
    currentSearchIndex,
    showScrollBanner,
    showJumpButton,
    msgContextMenu,
    editTargetMessage,
    editText,
    typingUsers,
    lightboxUrl,
    conversation,
    groupDetails,
    isComposerDisabled,

    // Refs
    chatEndRef,
    containerRef,

    // Handlers
    setText,
    setRichHtml,
    setAttachments,
    setShowSearch,
    setLocalSearchQuery,
    setLightboxUrl,
    setMsgContextMenu,
    setEditText,
    handleScroll,
    handleSearchNext,
    handleTextChange,
    handleRichTextChange,
    handleToggleComposerMode,
    handleSend,
    handleKeyDown,
    handleMessageContextMenu,
    handleDeleteMessage,
    handleEditMessage,
    handleConfirmEdit,
    handleCancelEdit,
    scrollToBottom,

    // Utilities
    getPlainTextFromHtml,
    sanitizeMessageHtml,
  };
};
