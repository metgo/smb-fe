import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CornerDownLeft,
  Info,
  Megaphone,
  Type,
  XCircle,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { timeAgo, getPlainTextFromRichText } from "@/helpers";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { BroadcastListInfoModal } from "../../modals";

interface BroadcastViewProps {
  conversationId: string;
  conversation?: any;
  currentUser: IChatUser | null;
  chatUsers?: any[];
  onBack: () => void;
  onGroupLeft?: () => void;
  broadcastWindow: ReturnType<
    typeof import("@/hooks/useBroadcastWindow").useBroadcastWindow
  >;
  showBroadcastInfoModal: boolean;
  setShowBroadcastInfoModal: (show: boolean) => void;
}

export const BroadcastView: React.FC<BroadcastViewProps> = ({
  conversationId,
  conversation,
  currentUser,
  chatUsers,
  onBack,
  onGroupLeft,
  broadcastWindow,
  showBroadcastInfoModal,
  setShowBroadcastInfoModal,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    inputClasses,
  } = useThemeClasses();

  const {
    list,
    isListFetching,
    history,
    isHistoryFetching,
    messageText,
    isRichMode,
    richHtml,
    isSending,
    handleTextChange,
    handleRichTextChange,
    handleToggleComposerMode,
    handleSend: handleSendBroadcast,
    handleKeyDown: handleBroadcastKeyDown,
  } = broadcastWindow;

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
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button
            onClick={onBack}
            className={clsx(
              "md:hidden rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
            )}
          >
            <ArrowLeft className={clsx(textSecondary)} />
          </button>
          <div
            className={clsx(
              "w-9 h-9 rounded-full border shrink-0 flex items-center justify-center",
              borderColor,
              isDark
                ? "bg-gray-800 text-gray-200"
                : "bg-gray-100 text-gray-600",
            )}
          >
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3
              className={clsx(
                "text-sm md:text-base font-bold truncate",
                textPrimary,
              )}
            >
              {list?.name || conversation?.name}
            </h3>
            <p className={clsx("text-[10px] hidden md:block", textTertiary)}>
              {t("members_count", { count: list?.memberCount ?? 0 })}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBroadcastInfoModal(true)}
          className={clsx(
            "p-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
            hoverBg,
            textTertiary,
          )}
          title={t("broadcast_list_info")}
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Send history */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar min-h-0">
        <p
          className={clsx(
            "text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5",
            textTertiary,
          )}
        >
          <Clock className="w-3 h-3" />
          {t("broadcast_send_history")}
        </p>

        {isListFetching || isHistoryFetching ? (
          <p className={clsx("text-sm text-center py-8", textSecondary)}>
            {t("loading")}
          </p>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center select-none px-4 py-12">
            <Megaphone className={clsx("w-10 h-10 mb-2", textTertiary)} />
            <p className={clsx("text-sm font-medium", textSecondary)}>
              {t("no_broadcast_history")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => {
              const total = entry.sentCount + entry.failedCount;
              const allDelivered = entry.failedCount === 0;
              return (
                <div
                  key={entry._id}
                  className={clsx(
                    "rounded-2xl border shadow-sm overflow-hidden",
                    borderColor,
                    bgPrimary,
                  )}
                >
                  <div className="flex items-start gap-3 p-3.5 md:p-4">
                    <div
                      className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        isDark
                          ? "bg-teal-950/40 text-teal-400"
                          : "bg-teal-50 text-teal-700",
                      )}
                    >
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={clsx(
                          "text-sm wrap-break-word rich-message-content",
                          textPrimary,
                        )}
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                      />
                      <div className="flex items-center justify-between mt-2.5 flex-wrap gap-2">
                        <span
                          className={clsx(
                            "text-[10px] flex items-center gap-1",
                            textTertiary,
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {timeAgo(entry.createdAt)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={clsx(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                              isDark
                                ? "bg-emerald-950/40 text-emerald-400"
                                : "bg-emerald-50 text-emerald-700",
                            )}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {t("broadcast_sent_ratio", {
                              sent: entry.sentCount,
                              total,
                            })}
                          </span>
                          {!allDelivered && (
                            <span
                              className={clsx(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                                isDark
                                  ? "bg-red-950/40 text-red-400"
                                  : "bg-red-50 text-red-700",
                              )}
                            >
                              <XCircle className="w-3 h-3" />
                              {entry.failedCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send composer */}
      <div
        className={clsx(
          "px-4 md:px-6 py-4 border-t shrink-0",
          borderColor,
          bgPrimary,
        )}
      >
        {list && list.memberCount === 0 ? (
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
              {t("broadcast_list_empty")}
            </span>
          </div>
        ) : isRichMode ? (
          <div className="space-y-2">
            <RichTextEditor
              value={richHtml}
              onChange={handleRichTextChange}
              placeholder={t("broadcast_message_placeholder")}
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
                onClick={handleSendBroadcast}
                disabled={isSending || !getPlainTextFromRichText(richHtml)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md shadow-teal-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {t("send")}
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2 md:gap-3">
            <div className="flex-1 relative">
              <textarea
                value={messageText}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleBroadcastKeyDown}
                rows={2}
                placeholder={t("broadcast_message_placeholder")}
                className={clsx(
                  "w-full px-4 py-3 border rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 resize-none min-h-12 max-h-32 custom-scrollbar transition-all duration-200",
                  inputClasses,
                )}
              />
            </div>

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

            <button
              onClick={handleSendBroadcast}
              disabled={isSending || !messageText.trim()}
              className="p-2.5 md:p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl cursor-pointer shadow-md shadow-teal-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <CornerDownLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {showBroadcastInfoModal && (
        <BroadcastListInfoModal
          isOpen={showBroadcastInfoModal}
          onClose={() => setShowBroadcastInfoModal(false)}
          broadcastListId={conversationId}
          currentUser={currentUser}
          chatUsers={chatUsers || []}
          onDeleted={onGroupLeft}
        />
      )}

      <style>{`
        .rich-message-content p { margin: 0 0 0.35em; }
        .rich-message-content p:last-child { margin-bottom: 0; }
        .rich-message-content ul, .rich-message-content ol { margin: 0.25em 0; padding-left: 1.25em; }
        .rich-message-content a { text-decoration: underline; }
        .rich-message-content blockquote { border-left: 2px solid currentColor; opacity: 0.85; padding-left: 0.6em; margin: 0.35em 0; }
      `}</style>
    </div>
  );
};
