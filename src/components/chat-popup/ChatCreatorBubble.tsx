import clsx from "clsx";
import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { getInitials, timeAgo } from "@/helpers";
import { useAppDispatch } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useSocket } from "@/providers/SocketProvider";
import { openChatPopup } from "@/features/chatPopupSlice";
import { useChatConversationsQuery } from "@/store/api/chatSystemApi";

interface ChatCreatorBubbleProps {
  /** The logged-in business creator viewing this page. */
  creator: IChatUser;
}

/**
 * Facebook-Messenger-style floating bubble that surfaces the latest DM
 * received by the business creator (e.g. from a superadmin reaching out
 * about their business). Only rendered by the caller when the logged-in
 * user is the business creator themself (and not a superadmin); hides
 * itself entirely whenever there is no DM conversation with any messages
 * yet. Closing the preview collapses it to a small round icon (rather than
 * hiding it for good) — clicking that icon brings the preview back.
 */
export const ChatCreatorBubble: React.FC<ChatCreatorBubbleProps> = ({
  creator,
}) => {
  const dispatch = useAppDispatch();
  const socket = useSocket();
  const { isDark, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();

  const [collapsed, setCollapsed] = useState(false);

  const { data: conversationsRes, refetch } = useChatConversationsQuery(
    { type: "dm", page: 1, limit: 50 },
    { skip: !creator._id },
  );

  // The creator is viewing their own business, so the relevant DM is the
  // most recently active one where someone else (e.g. a superadmin) has
  // messaged them — not a conversation keyed off the creator's own id.
  const conversation = conversationsRes?.data
    .filter((c) => c.otherParticipant && c.lastMessagePreview)
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    )[0];

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: IChatSocketMessagePayload) => {
      if (payload.conversationId === conversation?._id) {
        setCollapsed(false);
      }
      refetch();
    };

    socket.on("chat:message", handleNewMessage);
    return () => {
      socket.off("chat:message", handleNewMessage);
    };
  }, [socket, conversation?._id, refetch]);

  if (!conversation?.otherParticipant || !conversation.lastMessagePreview) {
    return null;
  }

  const sender = conversation.otherParticipant;

  const handleOpen = () => {
    setCollapsed(true);
    dispatch(openChatPopup(sender));
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title={`Message ${sender.name}`}
        className={clsx(
          "fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full border shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
          borderColor,
          isDark ? "bg-gray-900" : "bg-white",
        )}
      >
        <span className="relative">
          <MessageCircle className={clsx("w-5 h-5", textPrimary)} />
          {conversation.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-white dark:ring-gray-900" />
          )}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end">
      <button
        onClick={handleOpen}
        className={clsx(
          "group flex items-center gap-2.5 max-w-72 pl-2 pr-3 py-2 rounded-full border shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95",
          borderColor,
          isDark ? "bg-gray-900" : "bg-white",
          conversation.unreadCount > 0 && "border-teal-500",
        )}
      >
        <span className="relative shrink-0">
          <span
            className={clsx(
              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs",
              isDark
                ? "bg-gray-800 text-gray-200"
                : "bg-gray-100 text-gray-600",
            )}
          >
            {getInitials(sender.name)}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-500 ring-2 ring-white dark:ring-gray-900" />
          )}
        </span>

        <span className="min-w-0 text-left">
          <span
            className={clsx(
              "text-xs font-semibold truncate block",
              textPrimary,
            )}
          >
            {sender.name}
          </span>
          <span className={clsx("text-[11px] truncate block", textSecondary)}>
            {conversation.lastMessagePreview}
          </span>
        </span>

        <span className={clsx("text-[10px] shrink-0", textTertiary)}>
          {timeAgo(conversation.lastMessageAt)}
        </span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(true);
        }}
        title="Hide"
        className={clsx(
          "-ml-2 mb-8 p-1 rounded-full border shadow cursor-pointer transition-colors",
          borderColor,
          isDark
            ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
            : "bg-white text-gray-500 hover:bg-gray-100",
        )}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
