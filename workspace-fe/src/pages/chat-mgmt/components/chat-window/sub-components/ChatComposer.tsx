import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { AlertCircle, CornerDownLeft, Type } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import RichTextEditor from "@/components/shared/RichTextEditor";

interface ChatComposerProps {
  isComposerDisabled: boolean;
  isRichMode: boolean;
  richHtml: string;
  text: string;
  attachments: IAttachment[];
  handleRichTextChange: (value: string) => void;
  handleTextChange: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleToggleComposerMode: () => void;
  handleSend: () => void;
  getPlainTextFromHtml: (html: string) => string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  isComposerDisabled,
  isRichMode,
  richHtml,
  text,
  attachments,
  handleRichTextChange,
  handleTextChange,
  handleKeyDown,
  handleToggleComposerMode,
  handleSend,
  getPlainTextFromHtml,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    borderColor,
    bgPrimary,
    hoverBg,
    textTertiary,
    inputClasses,
  } = useThemeClasses();

  return (
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
            onClick={handleSend}
            disabled={!text.trim() && attachments.length === 0}
            className="p-2.5 md:p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl cursor-pointer shadow-md shadow-teal-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <CornerDownLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
