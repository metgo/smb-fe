import clsx from "clsx";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
  Mail,
  UserCircle,
  ArrowLeft,
  Info,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatWindow } from "@/hooks/useChatWindow";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { getInitials, timeAgo } from "@/helpers";
import ChatUserProfile from "./ChatUserProfile";
import { GroupInfoModal } from "./modals";

interface ChatWindowProps {
  conversationId: string;
  currentUser: IChatUser | null;
  highlightMessageId?: string; // used for global search navigation
  onBack: () => void;
  chatUsers?: any[];
  conversation?: any;
  presence?: Record<string, IPresenceEntry>;
  pendingDmRecipientId?: string;
  onPendingDmResolved?: (pendingId: string, realConversationId: string) => void;
  onGroupLeft?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUser,
  highlightMessageId,
  onBack,
  chatUsers,
  conversation,
  presence = {},
  pendingDmRecipientId,
  onPendingDmResolved,
  onGroupLeft,
}) => {
  const { t } = useTranslation("chat");
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
    pendingDmRecipientId,
    onPendingDmResolved,
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [groupSenderProfileEmail, setGroupSenderProfileEmail] = useState<
    string | null
  >(null);

  const {
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
    isComposerDisabled,
    chatEndRef,
    containerRef,
    setShowSearch,
    setLocalSearchQuery,
    setLightboxUrl,
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
    getPlainTextFromHtml,
  } = chatWindow;

  // The other participant in a DM, used for the "no previous conversation"
  // quick-info card shown before any messages have been exchanged. Prefer
  // the conversation's own otherParticipant (always present for DMs from
  // the API) over the paginated chatUsers list, which may not include
  // every user the current account has a DM with.
  const dmUser =
    conversation?.type === "dm"
      ? conversation.otherParticipant ||
        chatUsers?.find((u: any) => u._id === conversation.members[0])
      : undefined;
  const isNewDm = conversation?.type === "dm" && messages.length === 0;

  // Online status line shown in the header for DMs only
  const dmPresence = dmUser ? presence[dmUser._id] : undefined;
  const presenceLabel = dmPresence
    ? dmPresence.isOnline
      ? t("online_status")
      : dmPresence.lastActiveAt
        ? t("last_seen", { time: timeAgo(dmPresence.lastActiveAt) })
        : null
    : null;

  // Group date separators (Story 11)
  const renderMessageList = () => {
    const list: React.ReactNode[] = [];
    let lastDateStr = "";

    const sliced = messages;

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
              <button
                type="button"
                onClick={() => {
                  if (conversation?.type === "dm") return;
                  const sender = chatUsers?.find(
                    (u: any) => u._id === msg.senderId,
                  );
                  if (sender?.email) setGroupSenderProfileEmail(sender.email);
                }}
                disabled={conversation?.type === "dm"}
                className={clsx(
                  "w-12 h-12 rounded-full border shrink-0 flex items-center justify-center font-bold text-lg",
                  borderColor,
                  isDark
                    ? "bg-gray-800 text-gray-200"
                    : "bg-gray-100 text-gray-600",
                  conversation?.type !== "dm" &&
                    "cursor-pointer hover:opacity-80",
                )}
              >
                {getInitials(
                  conversation?.type === "dm"
                    ? conversation?.name
                    : msg.senderName,
                )}
              </button>
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
                    {t("message_removed_by_admin")}
                  </span>
                ) : editTargetMessage?.id === msg.id ? (
                  <div className="space-y-2">
                    <RichTextEditor
                      value={editText}
                      onChange={setEditText}
                      placeholder={t("type_a_message")}
                      maxLength={2000}
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
                        {t("cancel")}
                      </button>
                      <button
                        onClick={handleConfirmEdit}
                        disabled={!getPlainTextFromHtml(editText)}
                        className="px-2 py-1 text-xs font-semibold bg-teal-600 disabled:opacity-50 text-white rounded hover:bg-teal-700 cursor-pointer transition-colors"
                      >
                        {t("save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      "text-sm wrap-break-word rich-message-content",
                      isMe ? "rich-message-content--inverted" : "",
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.text,
                    }}
                  />
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
              {msg.edited && <span className="italic">{t("edited")}</span>}
              {isMe && !msg.isDeleted && (
                <div
                  className="cursor-help relative group"
                  title={
                    conversation?.type === "group" &&
                    allRead &&
                    !receiptsDisabled
                      ? t("read_by_all")
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
                          {t("read_by")}
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
                              <span className="opacity-70">{t("read")}</span>
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
              "md:hidden rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
            )}
          >
            <ArrowLeft className={clsx(textSecondary)} />
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
            {conversation?.type !== "dm" ? (
              <p className={clsx("text-[10px] hidden md:block", textTertiary)}>
                {t("members_count", { count: conversation?.members.length })}{" "}
                &bull; {conversation?.description}
              </p>
            ) : (
              presenceLabel && (
                <p
                  className={clsx(
                    "text-[10px]",
                    dmPresence?.isOnline
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : textTertiary,
                  )}
                >
                  {presenceLabel}
                </p>
              )
            )}
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-2">
          {conversation?.type === "group" && (
            <button
              onClick={() => setShowGroupInfoModal(true)}
              className={clsx(
                "p-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
                hoverBg,
                textTertiary,
              )}
              title={t("group_info")}
            >
              <Info className="w-4 h-4" />
            </button>
          )}
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
            title={t("search_inside_chat")}
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
            placeholder={t("search_keywords_inside_conversation")}
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
                {t("search_result_count", {
                  current: currentSearchIndex + 1,
                  total: localSearchResults.length,
                })}
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
            {t("cancel")}
          </button>
        </div>
      )}

      {/* Messages Scroll Panel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar min-h-0"
      >
        {isNewDm && dmUser ? (
          <div className="flex flex-col items-center justify-center h-full text-center select-none px-4">
            <div
              className={clsx(
                "w-16 h-16 rounded-full border shrink-0 flex items-center justify-center font-bold text-xl mb-3",
                borderColor,
                isDark
                  ? "bg-gray-800 text-gray-200"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {getInitials(dmUser.name)}
            </div>
            <h4 className={clsx("text-sm font-bold", textPrimary)}>
              {dmUser.name}
            </h4>
            {dmUser.email && (
              <p
                className={clsx(
                  "text-xs flex items-center gap-1.5 mt-1",
                  textTertiary,
                )}
              >
                <Mail className="w-3.5 h-3.5" />
                {dmUser.email}
              </p>
            )}
            <p className={clsx("text-[11px] mt-2", textTertiary)}>
              {t("no_previous_conversation")}
            </p>
            {dmUser.email && (
              <button
                onClick={() => setShowProfileModal(true)}
                className={clsx(
                  "mt-4 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all duration-200 hover:scale-105 active:scale-95",
                  borderColor,
                  textSecondary,
                  hoverBg,
                )}
              >
                <UserCircle className="w-4 h-4" />
                {t("view_profile_button")}
              </button>
            )}
          </div>
        ) : (
          renderMessageList()
        )}

        {/* Typing Indicators (Story 7) */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className={clsx("flex space-x-1 p-2 rounded-2xl", bgTertiary)}>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-0" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-300" />
            </div>
            <span className={clsx("text-[10px] italic", textTertiary)}>
              {t("is_typing", { users: typingUsers.join(` ${t("and")} `) })}
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
          {t("new_message")} &darr;
        </button>
      )}

      {showJumpButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold p-2 rounded-full shadow-lg cursor-pointer z-10"
          title={t("jump_to_latest")}
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
            <span className="flex items-center gap-1 md:gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden md:inline">
                {t("read_only_channel_desc")}
              </span>
              <span className="md:hidden">{t("read_only_channel")}</span>
            </span>
          </div>
        ) : isRichMode ? (
          <div className="space-y-2">
            <RichTextEditor
              value={richHtml}
              onChange={handleRichTextChange}
              placeholder={t("type_a_message")}
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={handleToggleComposerMode}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                  hoverBg,
                  textTertiary,
                )}
                title={t("switch_to_plain_text")}
              >
                <Type className="w-4 h-4" />
                {t("plain_text")}
              </button>
              <button
                onClick={handleSend}
                disabled={
                  !getPlainTextFromHtml(richHtml) && attachments.length === 0
                }
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md shadow-teal-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {t("send")}
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
                rows={2}
                placeholder={t("type_a_message_with_rich_text_hint")}
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
              title={t("switch_to_rich_text_editor")}
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

      {/* Quick-info "View Profile" modal for a fresh DM contact */}
      {showProfileModal && dmUser?.email && (
        <ChatUserProfile
          email={dmUser.email}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Sender profile modal, opened from a group message avatar */}
      {groupSenderProfileEmail && (
        <ChatUserProfile
          email={groupSenderProfileEmail}
          onClose={() => setGroupSenderProfileEmail(null)}
        />
      )}

      {/* Group roster / management modal */}
      {showGroupInfoModal && conversation?.type === "group" && (
        <GroupInfoModal
          isOpen={showGroupInfoModal}
          onClose={() => setShowGroupInfoModal(false)}
          conversationId={conversationId}
          currentUser={currentUser}
          chatUsers={chatUsers || []}
          onLeft={onGroupLeft}
        />
      )}

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
              {t("edit")}
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
            {t("delete")}
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
