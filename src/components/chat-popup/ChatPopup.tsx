import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Maximize2, Minus, X, CornerDownLeft, Type } from "lucide-react";

import { getInitials, timeAgo } from "@/helpers";
import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatWindow } from "@/hooks/useChatWindow";
import { useChatConversationsQuery } from "@/store/api/chatSystemApi";
import RichTextEditorMinimal from "@/components/shared/RichTextEditorMinimal";

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
  /** Online/last-seen status for the receiver, if known. */
  presence?: IPresenceEntry;
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
  presence,
}) => {
  const { t } = useTranslation("chat");
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
    isRichMode,
    richHtml,
    setRichHtml,
    handleTextChange,
    handleToggleComposerMode,
    handleKeyDown,
    handleSend,
    chatEndRef,
    containerRef,
    handleScroll,
    getPlainTextFromHtml,
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
        "fixed bottom-10 z-50 w-96 rounded-xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-200",
        minimized ? "h-18" : isRichMode ? "h-125" : "h-105",
        presence && presence.isOnline ? "border-teal-500" : " border-gray-500",
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
          <div className="min-w-0">
            <span
              className={clsx(
                "text-sm font-semibold truncate block",
                textPrimary,
              )}
            >
              {receiver.name}
            </span>
            <span className={clsx("text-[10px] truncate block", textTertiary)}>
              {receiver.email} &bull; {receiver.role}
            </span>
            {presence && (
              <span
                className={clsx(
                  "text-[10px] block",
                  presence.isOnline
                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                    : textTertiary,
                )}
              >
                {presence.isOnline
                  ? t("online_status")
                  : presence.lastActiveAt
                    ? t("last_seen", { time: timeAgo(presence.lastActiveAt) })
                    : null}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ">
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
                      "max-w-[75%] px-3 py-1.5 rounded-2xl text-xs wrap-break-word",
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
                    {msg.isDeleted ? (
                      "This message was deleted."
                    ) : (
                      <div
                        className="wrap-break-word rich-message-content"
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Composer */}
          <div className={clsx("px-2.5 py-2 border-t shrink-0", borderColor)}>
            {isRichMode ? (
              <div className="space-y-1.5">
                <RichTextEditorMinimal
                  value={richHtml}
                  onChange={setRichHtml}
                  placeholder={t("type_a_message")}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleToggleComposerMode}
                    className={clsx(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-colors",
                      hoverBg,
                      textTertiary,
                    )}
                  >
                    <Type className="w-3.5 h-3.5" />
                    {t("plain_text")}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!getPlainTextFromHtml(richHtml)}
                    className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-full cursor-pointer transition-colors shrink-0"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Aa"
                  className={clsx(
                    "flex-1 px-3 py-2 text-xs rounded-full focus:outline-hidden focus:ring-2 focus:ring-teal-500 border",
                    inputClasses,
                    borderColor,
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
            )}
          </div>
        </>
      )}
    </div>
  );
};
