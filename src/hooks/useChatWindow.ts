import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import DOMPurify from "dompurify";

import type { Message, Attachment, Conversation } from "@/pages/chat/types";

// Typing a markdown-style formatting character or a leading "/" switches
// the composer into the rich text editor, mirroring Teams' behavior.
const RICH_TEXT_TRIGGER = /^\/|[*_`#>[\]-]/;

const sanitizeMessageHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "hr",
      "code",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

interface UseChatWindowProps {
  conversationId: string;
  currentUser: IChatUser | null;
  highlightMessageId?: string;
  conversation?: Conversation;
  chatUsers?: IChatUser[];
}

export const useChatWindow = ({
  conversationId,
  currentUser,
  highlightMessageId,
  conversation,
  chatUsers,
}: UseChatWindowProps) => {
  // Message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [text, setText] = useState("");

  // Teams-style adaptive composer: plain textarea by default, switches to
  // the CKEditor rich text editor once the user types a formatting trigger.
  const [isRichMode, setIsRichMode] = useState(false);
  const [richHtml, setRichHtml] = useState("");

  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([]);

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
    message: Message;
  } | null>(null);
  const [editTargetMessage, setEditTargetMessage] = useState<Message | null>(
    null,
  );
  const [editText, setEditText] = useState("");

  // Typing indicators state
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Lightbox Image Viewer
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Fetch Conversation info
  // conversation is now passed as a prop from parent

  // Load message history
  const loadMessages = useCallback(() => {
    // TODO: fetch messages via API
    setMessages([]);
  }, [conversationId, currentUser]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBanner(false);
  };

  useEffect(() => {
    loadMessages();
    setVisibleCount(30);
    setAttachments([]);
    setShowSearch(false);
    setLocalSearchQuery("");
    setText("");
    setRichHtml("");
    setIsRichMode(false);

    // Setup listener for real-time messages
    const handleNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.convId === conversationId) {
        setMessages((prev) => [...prev, detail.message]);

        // Auto scroll helper
        if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            containerRef.current;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
          if (isNearBottom) {
            setTimeout(scrollToBottom, 50);
          } else {
            setShowScrollBanner(true);
          }
        }
      }
    };

    window.addEventListener("metgo_chat_message_received", handleNewMessage);
    window.addEventListener("metgo_chat_message_updated", loadMessages);

    return () => {
      window.removeEventListener(
        "metgo_chat_message_received",
        handleNewMessage,
      );
      window.removeEventListener("metgo_chat_message_updated", loadMessages);
    };
  }, [conversationId, currentUser, loadMessages]);

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

  // Handle typing simulation
  useEffect(() => {
    if (!conversation || !currentUser) return;

    // Simulate other users typing when we open a conversation, to make the app alive
    const eligibleOthers = conversation.members.filter(
      (id) => id !== currentUser._id,
    );
    if (eligibleOthers.length === 0) return;

    const timer = setTimeout(() => {
      // Pick a random participant
      const randomUserId =
        eligibleOthers[Math.floor(Math.random() * eligibleOthers.length)];
      const randomUser = chatUsers?.find((u) => u._id === randomUserId);

      if (randomUser) {
        setTypingUsers([randomUser.name || "User"]);

        // Disappear after 3 seconds of inactivity
        setTimeout(() => {
          setTypingUsers([]);
        }, 3000);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [conversation, currentUser, chatUsers]);

  // Monitor scrolling for infinite scroll & jump button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Jump button visibility (if scrolled up more than 400px)
    setShowJumpButton(scrollHeight - scrollTop - clientHeight > 400);

    // Infinite scroll upward (lazy-load next 30)
    if (scrollTop === 0 && messages.length > visibleCount) {
      const prevHeight = scrollHeight;
      setVisibleCount((prev) => prev + 30);
      // Adjust scroll to maintain position after loading older messages
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop =
            containerRef.current.scrollHeight - prevHeight;
        }
      }, 50);
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
            m.attachments?.some((a) =>
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
    if (!isRichMode && RICH_TEXT_TRIGGER.test(value)) {
      setIsRichMode(true);
      setRichHtml(`<p>${escapeHtml(value)}</p>`);
      setText("");
    }
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

  // Send Message logic
  const handleSend = () => {
    const plainFromRich = isRichMode ? getPlainTextFromHtml(richHtml) : "";
    const hasContent = isRichMode ? !!plainFromRich : !!text.trim();
    if (!hasContent && attachments.length === 0) return;
    if (!currentUser || !conversation) return;

    // Check if silenced
    const silence = false;
    if (silence) return;

    // Create Message object
    const newMsg: Message = {
      id: `msg-${conversationId}-${Date.now()}`,
      senderId: currentUser._id,
      senderName: currentUser.name || "User",
      senderAvatar: undefined,
      senderRole: currentUser.role,
      text: isRichMode ? sanitizeMessageHtml(richHtml) : text.trim(),
      isRichText: isRichMode,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      readBy: [currentUser._id],
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
    setRichHtml("");
    setIsRichMode(false);
    setAttachments([]);
    setTimeout(scrollToBottom, 50);

    // Simulate real-time mock responses to DMs to make the app interactive (Wow factor!)
    if (conversation.type === "dm") {
      const otherUser = chatUsers?.find(
        (u) =>
          u._id !== currentUser._id && conversation.members.includes(u._id),
      );
      if (otherUser) {
        const previewText = isRichMode ? plainFromRich : newMsg.text;
        setTimeout(() => {
          // Trigger typing indicator
          setTypingUsers([otherUser.name || "User"]);

          setTimeout(() => {
            setTypingUsers([]);
            // Add automated mock reply
            const replyMsg: Message = {
              id: `msg-${conversationId}-${Date.now() + 1}`,
              senderId: otherUser._id,
              senderName: otherUser.name || "User",
              senderAvatar: undefined,
              senderRole: otherUser.role,
              text: `Thanks for messaging. I got your request regarding: "${previewText.slice(0, 30)}". Let's coordinate!`,
              timestamp: new Date().toISOString(),
              readBy: [otherUser._id],
            };
            setMessages((prev) => [...prev, replyMsg]);
          }, 2000);
        }, 1500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Message Right Click context menu
  const handleMessageContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    if (msg.isSystem) return;
    setMsgContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg,
    });
  };

  // Silenced status check
  const silence = undefined;
  const isComposerDisabled =
    !!silence ||
    (conversation?.type === "broadcast" &&
      conversation.creatorId !== currentUser?._id &&
      currentUser?.role !== "superadmin");

  // Deletion logic
  const handleDeleteMessage = (msg: Message) => {
    const isOwner = currentUser?._id === msg.senderId;
    const isAdmin =
      currentUser && ["superadmin", "admin"].includes(currentUser.role);

    if (isOwner || isAdmin) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                isDeleted: true,
                deletedReason: isOwner
                  ? "Deleted by owner"
                  : "Deleted by admin",
                deletedBy: currentUser?._id,
              }
            : m,
        ),
      );
    }
    setMsgContextMenu(null);
  };

  // Edit message logic - inline editing
  const handleEditMessage = (msg: Message) => {
    const isOwner = currentUser?._id === msg.senderId;
    if (isOwner && !msg.isSystem && !msg.isDeleted) {
      setEditTargetMessage(msg);
      setEditText(msg.text);
    }
    setMsgContextMenu(null);
  };

  const handleConfirmEdit = () => {
    if (!editTargetMessage || !currentUser) return;
    if (!editText.trim()) {
      return;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === editTargetMessage.id
          ? {
              ...m,
              text: editText.trim(),
              edited: true,
              editedAt: new Date().toISOString(),
            }
          : m,
      ),
    );

    setEditTargetMessage(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditTargetMessage(null);
    setEditText("");
  };

  return {
    // State
    messages,
    visibleCount,
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
    silence,
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
