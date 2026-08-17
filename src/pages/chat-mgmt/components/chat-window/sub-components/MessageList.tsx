import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { MessageBubble } from "./MessageBubble";
import { NewDmEmptyState } from "./NewDmEmptyState";

interface MessageListProps {
  messages: IMessage[];
  currentUser: IChatUser | null;
  conversation?: any;
  chatUsers?: any[];
  localSearchResults: string[];
  currentSearchIndex: number;
  editTargetMessage: IMessage | null;
  editText: string;
  setEditText: (text: string) => void;
  handleCancelEdit: () => void;
  handleConfirmEdit: () => void;
  handleMessageContextMenu: (e: React.MouseEvent, msg: IMessage) => void;
  getPlainTextFromHtml: (html: string) => string;
  onOpenGroupSenderProfile: (email: string) => void;
  isNewDm: boolean;
  dmUser: any;
  onViewProfile: () => void;
  typingUsers: string[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  conversation,
  chatUsers,
  localSearchResults,
  currentSearchIndex,
  editTargetMessage,
  editText,
  setEditText,
  handleCancelEdit,
  handleConfirmEdit,
  handleMessageContextMenu,
  getPlainTextFromHtml,
  onOpenGroupSenderProfile,
  isNewDm,
  dmUser,
  onViewProfile,
  typingUsers,
  containerRef,
  chatEndRef,
  handleScroll,
}) => {
  const { t } = useTranslation("chat");
  const { bgTertiary, textTertiary, borderColor } = useThemeClasses();

  // Group date separators (Story 11)
  const renderMessageList = () => {
    const list: React.ReactNode[] = [];
    let lastDateStr = "";

    messages.forEach((msg) => {
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

      const isSearchResult = localSearchResults.includes(msg.id);
      const isCurrentSearchHighlight =
        isSearchResult && localSearchResults[currentSearchIndex] === msg.id;

      list.push(
        <MessageBubble
          key={msg.id}
          msg={msg}
          currentUser={currentUser}
          conversation={conversation}
          chatUsers={chatUsers}
          isSearchResult={isSearchResult}
          isCurrentSearchHighlight={isCurrentSearchHighlight}
          editTargetMessage={editTargetMessage}
          editText={editText}
          setEditText={setEditText}
          handleCancelEdit={handleCancelEdit}
          handleConfirmEdit={handleConfirmEdit}
          handleMessageContextMenu={handleMessageContextMenu}
          getPlainTextFromHtml={getPlainTextFromHtml}
          onOpenGroupSenderProfile={onOpenGroupSenderProfile}
        />,
      );
    });

    return list;
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar min-h-0"
    >
      {isNewDm && dmUser ? (
        <NewDmEmptyState dmUser={dmUser} onViewProfile={onViewProfile} />
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
  );
};
