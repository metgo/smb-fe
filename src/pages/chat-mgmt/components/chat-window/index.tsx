import clsx from "clsx";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatWindow } from "@/hooks/useChatWindow";
import { useBroadcastWindow } from "@/hooks/useBroadcastWindow";
import { timeAgo } from "@/helpers";
import { GroupInfoModal } from "../modals";
import ChatUserProfile from "../ChatUserProfile";
import {
  BroadcastView,
  ChatWindowHeader,
  ChatSearchBar,
  MessageList,
  ScrollJumpButtons,
  ChatComposer,
  MessageContextMenu,
  LightboxViewer,
} from "./sub-components";

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
  const { bgSecondary } = useThemeClasses();

  const isBroadcast = conversation?.type === "broadcast";

  // Broadcast lists have no shared thread/socket feed — skip the DM/Group
  // message pipeline entirely and only pay for the pending-DM path.
  const chatWindow = useChatWindow({
    conversationId,
    currentUser,
    highlightMessageId,
    conversation,
    chatUsers,
    pendingDmRecipientId: isBroadcast ? undefined : pendingDmRecipientId,
    onPendingDmResolved,
  });

  const broadcastWindow = useBroadcastWindow({
    broadcastListId: isBroadcast ? conversationId : "",
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showBroadcastInfoModal, setShowBroadcastInfoModal] = useState(false);
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
    groupDetails,
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

  // Broadcast lists have no shared thread — the body shows the owner's own
  // send-history log (§9 of the FE guide) instead of a message feed, and the
  // composer fans a send out into independent DMs rather than posting here.
  if (isBroadcast) {
    return (
      <BroadcastView
        conversationId={conversationId}
        conversation={conversation}
        currentUser={currentUser}
        chatUsers={chatUsers}
        onBack={onBack}
        onGroupLeft={onGroupLeft}
        broadcastWindow={broadcastWindow}
        showBroadcastInfoModal={showBroadcastInfoModal}
        setShowBroadcastInfoModal={setShowBroadcastInfoModal}
      />
    );
  }

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col h-full relative overflow-hidden select-none",
        bgSecondary,
      )}
    >
      <ChatWindowHeader
        conversation={conversation}
        groupMemberCount={groupDetails?.participants.length}
        onBack={onBack}
        presenceLabel={presenceLabel}
        isDmOnline={!!dmPresence?.isOnline}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        setShowGroupInfoModal={setShowGroupInfoModal}
      />

      {showSearch && (
        <ChatSearchBar
          localSearchQuery={localSearchQuery}
          setLocalSearchQuery={setLocalSearchQuery}
          localSearchResults={localSearchResults}
          currentSearchIndex={currentSearchIndex}
          handleSearchNext={handleSearchNext}
          onClose={() => {
            setShowSearch(false);
            setLocalSearchQuery("");
          }}
        />
      )}

      <MessageList
        messages={messages}
        currentUser={currentUser}
        conversation={conversation}
        chatUsers={chatUsers}
        localSearchResults={localSearchResults}
        currentSearchIndex={currentSearchIndex}
        editTargetMessage={editTargetMessage}
        editText={editText}
        setEditText={setEditText}
        handleCancelEdit={handleCancelEdit}
        handleConfirmEdit={handleConfirmEdit}
        handleMessageContextMenu={handleMessageContextMenu}
        getPlainTextFromHtml={getPlainTextFromHtml}
        onOpenGroupSenderProfile={setGroupSenderProfileEmail}
        isNewDm={isNewDm}
        dmUser={dmUser}
        onViewProfile={() => setShowProfileModal(true)}
        typingUsers={typingUsers}
        containerRef={containerRef}
        chatEndRef={chatEndRef}
        handleScroll={handleScroll}
      />

      <ScrollJumpButtons
        showScrollBanner={showScrollBanner}
        showJumpButton={showJumpButton}
        scrollToBottom={scrollToBottom}
      />

      <ChatComposer
        isComposerDisabled={isComposerDisabled}
        isRichMode={isRichMode}
        richHtml={richHtml}
        text={text}
        attachments={attachments}
        handleRichTextChange={handleRichTextChange}
        handleTextChange={handleTextChange}
        handleKeyDown={handleKeyDown}
        handleToggleComposerMode={handleToggleComposerMode}
        handleSend={handleSend}
        getPlainTextFromHtml={getPlainTextFromHtml}
      />

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
        <LightboxViewer
          lightboxUrl={lightboxUrl}
          onClose={() => setLightboxUrl(null)}
        />
      )}

      {/* Message context options popup menu */}
      {msgContextMenu && (
        <MessageContextMenu
          msgContextMenu={msgContextMenu}
          currentUser={currentUser}
          handleEditMessage={handleEditMessage}
          handleDeleteMessage={handleDeleteMessage}
        />
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
