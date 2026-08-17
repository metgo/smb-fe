import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Check, CheckCheck, ShieldAlert } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getInitials } from "@/helpers";
import RichTextEditor from "@/components/shared/RichTextEditor";

interface MessageBubbleProps {
  msg: IMessage;
  currentUser: IChatUser | null;
  conversation?: any;
  chatUsers?: any[];
  isSearchResult: boolean;
  isCurrentSearchHighlight: boolean;
  editTargetMessage: IMessage | null;
  editText: string;
  setEditText: (text: string) => void;
  handleCancelEdit: () => void;
  handleConfirmEdit: () => void;
  handleMessageContextMenu: (e: React.MouseEvent, msg: IMessage) => void;
  getPlainTextFromHtml: (html: string) => string;
  onOpenGroupSenderProfile: (email: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  currentUser,
  conversation,
  chatUsers,
  isSearchResult,
  isCurrentSearchHighlight,
  editTargetMessage,
  editText,
  setEditText,
  handleCancelEdit,
  handleConfirmEdit,
  handleMessageContextMenu,
  getPlainTextFromHtml,
  onOpenGroupSenderProfile,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    bgTertiary,
  } = useThemeClasses();

  if (msg.isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] font-medium text-gray-400 italic">
          {msg.text}
        </span>
      </div>
    );
  }

  const isMe = msg.senderId === currentUser?._id;

  // Double blue ticks check (Receipt rules)
  const receiptsDisabled = false; // Mock DB removed

  const allRead = conversation?.members.every(
    (mId: any) => mId === msg.senderId || msg.readBy.includes(mId),
  );

  return (
    <div
      id={`msg-${msg.id}`}
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
              if (sender?.email) onOpenGroupSenderProfile(sender.email);
            }}
            disabled={conversation?.type === "dm"}
            className={clsx(
              "w-12 h-12 rounded-full border shrink-0 flex items-center justify-center font-bold text-lg",
              borderColor,
              isDark
                ? "bg-gray-800 text-gray-200"
                : "bg-gray-100 text-gray-600",
              conversation?.type !== "dm" && "cursor-pointer hover:opacity-80",
            )}
          >
            {getInitials(
              conversation?.type === "dm" ? conversation?.name : msg.senderName,
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
              {msg.senderName}
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
                dangerouslySetInnerHTML={{ __html: msg.text }}
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
                conversation?.type === "group" && allRead && !receiptsDisabled
                  ? t("read_by_all")
                  : undefined
              }
            >
              {receiptsDisabled ? (
                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
              ) : allRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              ) : msg.readBy.length > 1 ? (
                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
              ) : (
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
                      const member = chatUsers?.find((u: any) => u._id === mId);
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
    </div>
  );
};
