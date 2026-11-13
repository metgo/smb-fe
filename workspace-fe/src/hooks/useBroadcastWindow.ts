import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { sanitizeMessageHtml, getPlainTextFromRichText } from "@/helpers";
import {
  useBroadcastListDetailsQuery,
  useBroadcastMessagesQuery,
  useSendBroadcastMutation,
} from "@/store/api/chatSystemApi";

interface UseBroadcastWindowProps {
  broadcastListId: string;
}

// Typing a markdown-style formatting character or a leading "/" switches
// the composer into the rich text editor, mirroring the DM/group composer.
const RICH_TEXT_TRIGGER = /^\/|[*_`#>[\]-]/;

// Escapes plain text before seeding it as CKEditor's initial HTML
const escapeHtml = (value: string) => {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
};

// Broadcast lists have no shared thread/socket feed of their own — the
// "message list" shown here is the owner's own send-history log (§9 of the
// FE guide), and sending fans out into independent DMs server-side rather
// than posting into this view directly.
export const useBroadcastWindow = ({
  broadcastListId,
}: UseBroadcastWindowProps) => {
  const { t } = useTranslation("chat");
  const [messageText, setMessageText] = useState("");
  const [isRichMode, setIsRichMode] = useState(false);
  const [richHtml, setRichHtml] = useState("");

  const { data: list, isFetching: isListFetching } =
    useBroadcastListDetailsQuery(broadcastListId, {
      skip: !broadcastListId,
    });
  const { data: history, isFetching: isHistoryFetching } =
    useBroadcastMessagesQuery(
      { broadcastListId, page: 1, limit: 30 },
      { skip: !broadcastListId },
    );
  const [sendBroadcast, { isLoading: isSending }] = useSendBroadcastMutation();

  const handleTextChange = (value: string) => {
    setMessageText(value);
    if (!isRichMode && RICH_TEXT_TRIGGER.test(value)) {
      setIsRichMode(true);
      setRichHtml(`<p>${escapeHtml(value)}</p>`);
      setMessageText("");
    }
  };

  const handleRichTextChange = (value: string) => {
    setRichHtml(value);
  };

  const handleToggleComposerMode = () => {
    if (isRichMode) {
      setMessageText(getPlainTextFromRichText(richHtml));
      setRichHtml("");
      setIsRichMode(false);
    } else {
      setRichHtml(messageText ? `<p>${escapeHtml(messageText)}</p>` : "");
      setMessageText("");
      setIsRichMode(true);
    }
  };

  const handleSend = async () => {
    const content = isRichMode
      ? sanitizeMessageHtml(richHtml)
      : messageText.trim();
    const hasContent = isRichMode
      ? !!getPlainTextFromRichText(richHtml)
      : !!content;
    if (!hasContent) return;

    try {
      const res = await sendBroadcast({
        broadcastListId,
        content,
      }).unwrap();
      setMessageText("");
      setRichHtml("");
      setIsRichMode(false);
      toast.success(
        t("broadcast_sent_summary", {
          sent: res.sentCount,
          total: res.sentCount + res.failedCount,
        }),
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message && typeof error.data.message === "string"
          ? error.data.message
          : t("failed_to_send_broadcast"),
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return {
    list,
    isListFetching,
    history: history?.data || [],
    isHistoryFetching,
    messageText,
    setMessageText,
    isRichMode,
    richHtml,
    isSending,
    handleTextChange,
    handleRichTextChange,
    handleToggleComposerMode,
    handleSend,
    handleKeyDown,
  };
};
