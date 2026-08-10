import clsx from "clsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Maximize2, Minus, X, CornerDownLeft } from "lucide-react";

import { getInitials } from "@/helpers";
import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatWindow } from "@/hooks/useChatWindow";
import { useChatConversationsQuery } from "@/store/api/chatSystemApi";

interface ChatPopupProps {
  /** The person this popup is chatting with. */
  receiver: IChatUser;
  /** The logged-in user sending messages. */
  currentUser: IChatUser | null;
  minimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  /** Horizontal offset in px from the right edge, for stacking multiple popups. */
  rightOffset?: number;
}

/**
 * Facebook-Messenger-style floating chat popup, anchored to the bottom-right
 * corner. Clicking the expand button navigates to the full /chat screen
 * instead of rendering the thread inline.
 */
export const ChatPopup: React.FC<ChatPopupProps> = ({
  receiver,
  currentUser,
  minimized,
  onToggleMinimize,
  onClose,
  rightOffset = 0,
}) => {
  const navigate = useNavigate();
  const {
    isDark,
    bgPrimary,
    textPrimary,
    textTertiary,
    borderColor,
    hoverBg,
    inputClasses,
  } = useThemeClasses();

  // Find an existing DM conversation with this receiver, if one exists.
  const { data: conversationsRes } = useChatConversationsQuery(
    { type: "dm", page: 1, limit: 50 },
    { skip: !currentUser },
  );
  const existingConversation = conversationsRes?.data.find(
    (c) => c.otherParticipant?._id === receiver._id,
  );

  const [resolvedConversationId, setResolvedConversationId] = useState<
    string | null
  >(null);
  const isPendingDm = !existingConversation && !resolvedConversationId;
  const activeConversationId =
    resolvedConversationId ||
    existingConversation?._id ||
    `pending-dm-${receiver._id}`;

  const {
    messages,
    text,
    handleTextChange,
    handleKeyDown,
    handleSend,
    chatEndRef,
    containerRef,
    handleScroll,
  } = useChatWindow({
    conversationId: activeConversationId,
    currentUser,
    chatUsers: [receiver],
    pendingDmRecipientId: isPendingDm ? receiver._id : undefined,
    onPendingDmResolved: (_pendingId, realConversationId) => {
      setResolvedConversationId(realConversationId);
    },
  });

  const handleExpand = () => {
    navigate(routes.chat);
  };

  return (
    <div
      style={{ right: `${16 + rightOffset}px` }}
      className={clsx(
        "fixed bottom-0 z-50 w-80 rounded-t-xl border border-b-0 shadow-2xl flex flex-col overflow-hidden transition-all duration-200",
        minimized ? "h-12" : "h-105",
        borderColor,
        bgPrimary,
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "flex items-center justify-between gap-2 px-3 py-2.5 border-b shrink-0 cursor-pointer select-none",
          borderColor,
        )}
        onClick={onToggleMinimize}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={clsx(
              "w-8 h-8 rounded-full border shrink-0 flex items-center justify-center font-bold text-xs",
              borderColor,
              isDark
                ? "bg-gray-800 text-gray-200"
                : "bg-gray-100 text-gray-600",
            )}
          >
            {getInitials(receiver.name)}
          </div>
          <span className={clsx("text-sm font-semibold truncate", textPrimary)}>
            {receiver.name}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExpand();
            }}
            title="Open in full screen"
            className={clsx(
              "p-1.5 rounded-md cursor-pointer transition-colors",
              hoverBg,
              textTertiary,
            )}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
            title={minimized ? "Expand" : "Minimize"}
            className={clsx(
              "p-1.5 rounded-md cursor-pointer transition-colors",
              hoverBg,
              textTertiary,
            )}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close"
            className={clsx(
              "p-1.5 rounded-md cursor-pointer transition-colors",
              hoverBg,
              textTertiary,
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Message list */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
          >
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser?._id;
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <span className="text-[10px] italic text-gray-400">
                      {msg.text}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex",
                    isMe ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[75%] px-3 py-1.5 rounded-2xl text-xs break-words",
                      msg.isDeleted
                        ? "italic text-gray-400 bg-gray-100 dark:bg-gray-800"
                        : isMe
                          ? "bg-teal-600 text-white rounded-br-sm"
                          : clsx(
                              isDark
                                ? "bg-gray-800 text-gray-100"
                                : "bg-gray-100 text-gray-900",
                              "rounded-bl-sm",
                            ),
                    )}
                  >
                    {msg.isDeleted ? "This message was deleted." : msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Composer */}
          <div
            className={clsx(
              "px-2.5 py-2 border-t shrink-0 flex items-center gap-2",
              borderColor,
            )}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Aa"
              className={clsx(
                "flex-1 px-3 py-2 text-xs rounded-full focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                inputClasses,
              )}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-full cursor-pointer transition-colors shrink-0"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
