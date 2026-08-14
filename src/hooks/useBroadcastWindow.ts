import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import {
  useBroadcastListDetailsQuery,
  useBroadcastMessagesQuery,
  useSendBroadcastMutation,
} from "@/store/api/chatSystemApi";

interface UseBroadcastWindowProps {
  broadcastListId: string;
}

// Broadcast lists have no shared thread/socket feed of their own — the
// "message list" shown here is the owner's own send-history log (§9 of the
// FE guide), and sending fans out into independent DMs server-side rather
// than posting into this view directly.
export const useBroadcastWindow = ({
  broadcastListId,
}: UseBroadcastWindowProps) => {
  const { t } = useTranslation("chat");
  const [messageText, setMessageText] = useState("");

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

  const handleSend = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    try {
      const res = await sendBroadcast({
        broadcastListId,
        content: trimmed,
      }).unwrap();
      setMessageText("");
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
    isSending,
    handleSend,
    handleKeyDown,
  };
};
