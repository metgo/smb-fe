import React from "react";
import clsx from "clsx";
import {
  Download,
  Trash,
  AlertCircle,
  CornerDownLeft,
  Search,
  ArrowDown,
  ShieldAlert,
  Check,
  CheckCheck,
  Edit,
  Type,
} from "lucide-react";

// Removed MockChatDatabase imports
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatWindow } from "@/hooks/useChatWindow";
import CKEditorWrapper from "@/components/wrapper/CKEditorWrapper";

interface ChatWindowProps {
  conversationId: string;
  currentUser: IChatUser | null;
  highlightMessageId?: string; // used for global search navigation
  onBack: () => void;
  chatUsers?: any[];
  conversation?: any;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUser,
  highlightMessageId,
  onBack,
  chatUsers,
  conversation,
}) => {
  const {
    isDark,
    bgPrimary,
    bgSecondary,
    bgTertiary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    inputClasses,
  } = useThemeClasses();

  const chatWindow = useChatWindow({
    conversationId,
    currentUser,
    highlightMessageId,
    conversation,
    chatUsers,
  });

  const {
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
    silence,
    isComposerDisabled,
    chatEndRef,
    containerRef,
    setRichHtml,
    setShowSearch,
    setLocalSearchQuery,
    setLightboxUrl,
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
    getPlainTextFromHtml,
  } = chatWindow;

  // Group date separators (Story 11)
  const renderMessageList = () => {
    const list: React.ReactNode[] = [];
    let lastDateStr = "";

    // Paginate messages
    const sliced = messages.slice(-visibleCount);

    sliced.forEach((msg) => {
      // Date Separator calculation
      const msgDate = new Date(msg.timestamp);
      const dateStr = msgDate.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (dateStr !== lastDateStr) {
        list.push(
          <div key={`sep-${msg.id}`} className="flex justify-center my-4">
            <span
              className={clsx(
                "px-3 py-1 text-[10px] font-bold rounded-full border",
                bgTertiary,
                textTertiary,
                borderColor,
              )}
            >
              {dateStr}
            </span>
          </div>,
        );
        lastDateStr = dateStr;
      }

      // Check if message matches query
      const isSearchResult = localSearchResults.includes(msg.id);
      const isCurrentSearchHighlight =
        isSearchResult && localSearchResults[currentSearchIndex] === msg.id;

      if (msg.isSystem) {
        list.push(
          <div key={msg.id} className="flex justify-center my-2">
            <span className="text-[11px] font-medium text-gray-400 italic">
              {msg.text}
            </span>
          </div>,
        );
        return;
      }

      const isMe = msg.senderId === currentUser?._id;

      // Double blue ticks check (Receipt rules)
      const receiptsDisabled = false; // Mock DB removed

      const allRead = conversation?.members.every(
        (mId: any) => mId === msg.senderId || msg.readBy.includes(mId),
      );

      list.push(
        <div
          id={`msg-${msg.id}`}
          key={msg.id}
          onContextMenu={(e) => handleMessageContextMenu(e, msg)}
          className={`flex flex-col mb-4 group/row ${isMe ? "items-end" : "items-start"}`}
        >
          <div
            className={`flex gap-2 max-w-[70%] items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}
          >
            {!isMe && (
              <img
                src={
                  msg.senderAvatar ||
                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${msg.senderName}`
                }
                className={clsx(
                  "w-8 h-8 rounded-full border shrink-0 self-start mt-0.5 object-cover",
                  borderColor,
                  bgTertiary,
                )}
                alt=""
              />
            )}

            <div className="flex flex-col">
              {!isMe && conversation?.type !== "dm" && (
                <span
                  className={clsx(
                    "text-[10px] font-bold ml-1 mb-0.5",
                    isDark ? "text-teal-400" : "text-teal-700",
                  )}
                >
                  {msg.senderName} ({msg.senderRole})
                </span>
              )}

              <div
                className={clsx(
                  "p-4 rounded-2xl relative border shadow-sm transition-all duration-200",
                  msg.isDeleted
                    ? isDark
                      ? "bg-gray-800/60 text-gray-500 border-gray-700 italic"
                      : "bg-gray-50 text-gray-400 border-gray-200 italic"
                    : isMe
                      ? "bg-linear-to-br from-teal-600 to-teal-700 text-white border-teal-800 rounded-tr-none shadow-md shadow-teal-500/20"
                      : clsx(
                          bgTertiary,
                          textPrimary,
                          borderColor,
                          "rounded-tl-none",
                        ),
                  isCurrentSearchHighlight
                    ? "ring-3 ring-amber-500/50 shadow-lg shadow-amber-500/20"
                    : isSearchResult
                      ? "ring-2 ring-amber-500/20"
                      : "",
                )}
              >
                {/* Text Content */}
                {msg.isDeleted ? (
                  <span className="flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    This message was removed by an admin.
                  </span>
                ) : editTargetMessage?.id === msg.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className={clsx(
                        "w-full px-2 py-1.5 text-sm rounded-lg resize-none",
                        inputClasses,
                        "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                      )}
                      rows={3}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") handleCancelEdit();
                        if (e.key === "Enter" && e.ctrlKey) handleConfirmEdit();
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className={clsx(
                          "px-2 py-1 text-xs font-semibold border rounded cursor-pointer transition-colors",
                          borderColor,
                          textSecondary,
                          hoverBg,
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmEdit}
                        disabled={!editText.trim()}
                        className="px-2 py-1 text-xs font-semibold bg-teal-600 disabled:opacity-50 text-white rounded hover:bg-teal-700 cursor-pointer transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : msg.isRichText ? (
                  <div
                    className={clsx(
                      "text-sm wrap-break-word rich-message-content",
                      isMe ? "rich-message-content--inverted" : "",
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.text,
                    }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap wrap-break-word">
                    {msg.text}
                  </p>
                )}

                {/* Attachments rendering */}
                {!msg.isDeleted &&
                  msg.attachments &&
                  msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att) => {
                        const isImg = att.type.startsWith("image/");
                        if (isImg) {
                          return (
                            <div
                              key={att.id}
                              className={clsx(
                                "relative rounded-lg overflow-hidden border max-w-50",
                                isDark ? "border-white/10" : "border-black/10",
                              )}
                            >
                              <img
                                src={att.url}
                                alt=""
                                onClick={() => setLightboxUrl(att.url)}
                                className="w-full object-cover max-h-35 cursor-zoom-in hover:opacity-90"
                              />
                            </div>
                          );
                        } else {
                          return (
                            <a
                              key={att.id}
                              href={att.url}
                              download={att.name}
                              className={clsx(
                                "flex items-center gap-2 p-1.5 rounded-lg border text-xs leading-tight transition-colors",
                                isMe
                                  ? "bg-teal-700 hover:bg-teal-800 border-teal-800 text-white"
                                  : isDark
                                    ? "bg-gray-900 hover:bg-gray-800 border-gray-700 text-gray-300"
                                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-800",
                              )}
                            >
                              <Download className="w-4 h-4 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold truncate">
                                  {att.name}
                                </p>
                                <p className="text-[9px] opacity-75">
                                  {(att.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </a>
                          );
                        }
                      })}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Timestamp & Read Receipt Indicators (Story 7) */}
          {!msg.isSystem && (
            <div
              className={clsx(
                "flex items-center gap-1.5 mt-1 text-[9px] px-10",
                textTertiary,
                isMe ? "flex-row-reverse" : "flex-row",
              )}
            >
              <span>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {msg.edited && <span className="italic">(edited)</span>}
              {isMe && !msg.isDeleted && (
                <div
                  className="cursor-help relative group"
                  title={
                    conversation?.type === "group" &&
                    allRead &&
                    !receiptsDisabled
                      ? `Read by all members. Hover for list.`
                      : undefined
                  }
                >
                  {receiptsDisabled ? (
                    // Gray ticks if receipts disabled
                    <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                  ) : allRead ? (
                    // Double blue ticks if read by all
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  ) : msg.readBy.length > 1 ? (
                    // Double ticks if read by some
                    <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    // Single tick if delivered
                    <Check className="w-3.5 h-3.5 text-gray-400" />
                  )}

                  {/* Group Chat Read Ticks Hoverlist (Story 7) */}
                  {conversation?.type === "group" &&
                    !receiptsDisabled &&
                    allRead && (
                      <div className="absolute right-0 bottom-4 z-45 bg-gray-900 text-white text-[9px] p-2 rounded shadow-lg hidden group-hover:block min-w-30">
                        <p className="font-semibold border-b border-white/20 pb-0.5 mb-1">
                          Read by:
                        </p>
                        {conversation.members.map((mId: any) => {
                          const member = chatUsers?.find(
                            (u: any) => u._id === mId,
                          );
                          if (!member || mId === currentUser?._id) return null;
                          return (
                            <div
                              key={mId}
                              className="flex justify-between gap-2 py-0.5"
                            >
                              <span>{member.name}</span>
                              <span className="opacity-70">Read</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>,
      );
    });

    return list;
  };

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col h-full relative overflow-hidden select-none",
        bgSecondary,
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between z-10 shrink-0 shadow-sm",
          borderColor,
          bgPrimary,
        )}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onBack}
            className={clsx(
              "md:hidden p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
            )}
          >
            ←
          </button>
          <div className="min-w-0">
            <h3
              className={clsx(
                "text-sm md:text-base font-bold truncate",
                textPrimary,
              )}
            >
              {conversation?.name}
            </h3>
            {conversation?.type !== "dm" && (
              <p className={clsx("text-[10px] hidden md:block", textTertiary)}>
                {conversation?.members.length} members &bull;{" "}
                {conversation?.description}
              </p>
            )}
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={clsx(
              "p-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
              showSearch
                ? isDark
                  ? "bg-teal-950/30 text-teal-400 shadow-md shadow-teal-500/25"
                  : "bg-teal-50 text-teal-700 shadow-md shadow-teal-500/25"
                : clsx(hoverBg, textTertiary),
            )}
            title="Search inside chat"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Local Conversation Search Overlay */}
      {showSearch && (
        <div
          className={clsx(
            "px-4 py-3 border-b flex items-center gap-3 z-10 shrink-0",
            borderColor,
            bgPrimary,
          )}
        >
          <Search className={clsx("w-4 h-4", textTertiary)} />
          <input
            type="text"
            placeholder="Search keywords inside conversation..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className={clsx(
              "flex-1 px-4 py-2 text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all duration-200",
              inputClasses,
            )}
          />
          {localSearchResults.length > 0 && (
            <div
              className={clsx(
                "flex items-center gap-2 text-xs shrink-0",
                textTertiary,
              )}
            >
              <span className="font-medium">
                {currentSearchIndex + 1} of {localSearchResults.length}
              </span>
              <button
                onClick={() => handleSearchNext("prev")}
                className={clsx(
                  "p-2 rounded-xl border text-[10px] font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                  borderColor,
                  hoverBg,
                )}
              >
                ▲
              </button>
              <button
                onClick={() => handleSearchNext("next")}
                className={clsx(
                  "p-2 rounded-xl border text-[10px] font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                  borderColor,
                  hoverBg,
                )}
              >
                ▼
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setLocalSearchQuery("");
            }}
            className={clsx(
              "text-xs font-bold shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 px-3 py-2",
              textTertiary,
            )}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Messages Scroll Panel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar min-h-0"
      >
        {renderMessageList()}

        {/* Typing Indicators (Story 7) */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className={clsx("flex space-x-1 p-2 rounded-2xl", bgTertiary)}>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-0" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-300" />
            </div>
            <span className={clsx("text-[10px] italic", textTertiary)}>
              {typingUsers.join(" and ")} is typing...
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Jump buttons and banners */}
      {showScrollBanner && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          New message &darr;
        </button>
      )}

      {showJumpButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold p-2 rounded-full shadow-lg cursor-pointer z-10"
          title="Jump to latest"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Composer Input Area */}
      <div
        className={clsx(
          "px-4 md:px-6 py-4 border-t shrink-0",
          borderColor,
          bgPrimary,
        )}
      >
        {isComposerDisabled ? (
          <div
            className={clsx(
              "flex items-center justify-center p-2 md:p-3 border rounded-lg text-[10px] md:text-xs font-semibold select-none text-center",
              isDark
                ? "bg-red-950/20 text-red-400 border-red-900/40"
                : "bg-red-50 text-red-700 border-red-200",
            )}
          >
            {silence ? (
              <span className="flex items-center gap-1 md:gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {/* <span className="hidden md:inline">
                  You have been silenced globally. Expires:{" "}
                  {silence.expiresAt === "permanent"
                    ? "Indefinite"
                    : new Date(silence.expiresAt).toLocaleString()}
                  . Reason: {silence.reason}
                </span> */}
                <span className="md:hidden">Silenced globally</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 md:gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden md:inline">
                  Read-only channel. Only the channel owner can post
                  announcements.
                </span>
                <span className="md:hidden">Read-only channel</span>
              </span>
            )}
          </div>
        ) : isRichMode ? (
          <div className="space-y-2">
            <CKEditorWrapper
              value={richHtml}
              onChange={setRichHtml}
              placeholder="Type a message..."
              maxLength={2000}
              height={100}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={handleToggleComposerMode}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                  hoverBg,
                  textTertiary,
                )}
                title="Switch to plain text"
              >
                <Type className="w-4 h-4" />
                Plain text
              </button>
              <button
                onClick={handleSend}
                disabled={
                  !getPlainTextFromHtml(richHtml) && attachments.length === 0
                }
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md shadow-teal-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Send
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2 md:gap-3">
            {/* Input fields */}
            <div className="flex-1 relative">
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type a message... (start with *, #, - or / for rich text)"
                className={clsx(
                  "w-full px-4 py-3 border rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 resize-none min-h-12 max-h-32 custom-scrollbar transition-all duration-200",
                  inputClasses,
                )}
              />
            </div>

            {/* Manual rich text toggle */}
            <button
              onClick={handleToggleComposerMode}
              className={clsx(
                "p-2.5 md:p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                hoverBg,
                textTertiary,
              )}
              title="Switch to rich text editor"
            >
              <Type className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!text.trim() && attachments.length === 0}
              className="p-2.5 md:p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl cursor-pointer shadow-md shadow-teal-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <CornerDownLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Viewer Overlay (Story 6) */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            className="max-w-full max-h-full rounded shadow-2xl"
            alt=""
          />
        </div>
      )}

      {/* Message context options popup menu */}
      {msgContextMenu && (
        <div
          style={{ top: msgContextMenu.y, left: msgContextMenu.x }}
          className={clsx(
            "fixed z-50 border rounded-lg shadow-lg py-1 min-w-30",
            bgPrimary,
            borderColor,
          )}
        >
          {msgContextMenu.message.senderId === currentUser?._id && (
            <button
              onClick={() => handleEditMessage(msgContextMenu.message)}
              className={clsx(
                "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors",
                textSecondary,
                hoverBg,
              )}
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Message
            </button>
          )}
          <button
            onClick={() => handleDeleteMessage(msgContextMenu.message)}
            className={clsx(
              "w-full text-left px-3 py-1.5 text-xs text-destructive flex items-center gap-2 cursor-pointer font-semibold transition-colors",
              isDark ? "hover:bg-red-950/20" : "hover:bg-red-50",
            )}
          >
            <Trash className="w-3.5 h-3.5" />
            Delete Message
          </button>
        </div>
      )}

      <style>{`
        .rich-message-content p { margin: 0 0 0.35em; }
        .rich-message-content p:last-child { margin-bottom: 0; }
        .rich-message-content ul, .rich-message-content ol { margin: 0.25em 0; padding-left: 1.25em; }
        .rich-message-content a { text-decoration: underline; }
        .rich-message-content blockquote { border-left: 2px solid currentColor; opacity: 0.85; padding-left: 0.6em; margin: 0.35em 0; }
        .rich-message-content--inverted a { color: inherit; }
      `}</style>
    </div>
  );
};
