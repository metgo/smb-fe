import clsx from "clsx";
import { toast } from "sonner";
import { Eye, Loader, RotateCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { AField } from "./AField";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ModalWrapper } from "@/components/wrapper";
import {
  useEventSessionTargetAudienceQuery,
  useGetSendNotificationHistoryDetailsQuery,
  useGetSendNotificationHistoryQuery,
  useSendSessionNotificationMutation,
  useReSendSessionNotificationMutation,
} from "@/store/api/eventSessionApi";
import ReactMultiSelect, {
  type MultiSelectOption,
} from "@/components/form-fields/ReactMultiSelect";

interface AudienceSelection {
  isAll: boolean;
  users: ITargetAudience[];
}

const ALL_VALUE = "all";
const HISTORY_LIMIT = 10;
const HISTORY_SKELETON_ROWS = 4;

interface NotifyTabProps {
  config: IAdminConfig;
  records: IBookingRecord[];
  wrapperId: string;
}

export function NotifyTab({ wrapperId }: NotifyTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, inputClasses, cardClasses, borderColor } =
    useThemeClasses();

  const { data } = useEventSessionTargetAudienceQuery(
    wrapperId ? { wrapperId, limit: 10, page: 1 } : skipToken,
  );
  const audienceUsers = useMemo(() => data?.data?.users ?? [], [data]);

  const CARD = clsx(cardClasses, "rounded-[14px] p-5");
  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2 border",
    inputClasses,
    isDark
      ? "focus:border-blue-400 focus:ring-blue-400/10"
      : "focus:border-blue-500 focus:ring-blue-500/10",
  );
  const TH = clsx(
    "text-start py-2.25 px-3 text-[11.5px] uppercase tracking-[0.04em] border-b",
    textTertiary,
    borderColor,
  );
  const TD = clsx("py-2.75 px-3 border-b align-top", borderColor);

  const channelBtn = (active: boolean) =>
    clsx(
      "text-start px-3.5 py-3.5 rounded-[11px] border-[1.5px] flex flex-col gap-0.5 transition-colors",
      active
        ? isDark
          ? "border-blue-400 bg-blue-950/50"
          : "border-blue-600 bg-blue-50"
        : isDark
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white",
    );

  const [sendSessionNotification, { isLoading: isSending }] =
    useSendSessionNotificationMutation();
  const [reSendSessionNotification] = useReSendSessionNotificationMutation();

  const [audience, setAudience] = useState<AudienceSelection>({
    isAll: true,
    users: [],
  });
  const [channel, setChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [historyPage, setHistoryPage] = useState(1);
  const [history, setHistory] = useState<INotificationHistoryItem[]>([]);
  const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const historyScrollRef = useRef<HTMLDivElement | null>(null);

  const { data: historyDetails, isFetching: isHistoryDetailsFetching } =
    useGetSendNotificationHistoryDetailsQuery(
      viewHistoryId ? viewHistoryId : skipToken,
    );

  useEffect(() => {
    setHistoryPage(1);
    setHistory([]);
  }, [wrapperId]);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
  } = useGetSendNotificationHistoryQuery(
    wrapperId
      ? { wrapperId, page: historyPage, limit: HISTORY_LIMIT }
      : skipToken,
  );

  useEffect(() => {
    if (!historyData?.data.length) {
      if (historyPage === 1) setHistory([]);
      return;
    }
    setHistory((prev) => {
      if (historyPage === 1) return historyData.data;
      const existingIds = new Set(prev.map((h) => h._id));
      const newItems = historyData.data.filter((h) => !existingIds.has(h._id));
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [historyData, historyPage]);

  const hasMoreHistory = (historyData?.data.length ?? 0) >= HISTORY_LIMIT;

  const fetchNextHistoryPage = useCallback(() => {
    if (!hasMoreHistory || isHistoryFetching) return;
    setHistoryPage((prev) => prev + 1);
  }, [hasMoreHistory, isHistoryFetching]);

  useInfiniteScroll({
    ref: historyScrollRef,
    hasMore: hasMoreHistory,
    isLoading: isHistoryFetching,
    onLoadMore: fetchNextHistoryPage,
  });

  const isHistoryInitialLoading =
    historyPage === 1 && (isHistoryLoading || isHistoryFetching);

  async function handleResend(item: INotificationHistoryItem) {
    setResendingId(item._id);
    try {
      await reSendSessionNotification(item._id).unwrap();
      setHistoryPage(1);
      toast.success(t("toast_notification_sent"));
    } catch {
      toast.error(t("toast_notification_send_error"));
    } finally {
      setResendingId(null);
    }
  }

  const audienceOptions: MultiSelectOption[] = useMemo(
    () => [
      { label: t("all_registrants"), value: ALL_VALUE },
      ...audienceUsers.map((u) => ({ label: u.name, value: u.email })),
    ],
    [audienceUsers, t],
  );
  const audienceSelectedValues = audience.isAll
    ? [ALL_VALUE]
    : audience.users.map((u) => u.email);

  function handleAudienceChange(values: string[]) {
    if (values.length === 0) {
      setAudience({ isAll: false, users: [] });
      return;
    }
    if (values.length === 1 && values[0] === ALL_VALUE) {
      setAudience({ isAll: true, users: [] });
      return;
    }
    const selectedEmails = values.filter((v) => v !== ALL_VALUE);
    setAudience({
      isAll: false,
      users: audienceUsers.filter((u) => selectedEmails.includes(u.email)),
    });
  }

  const recipients = audience.isAll ? audienceUsers : audience.users;
  const count = new Set(recipients.map((r) => r.email)).size;

  async function send() {
    if (!subject.trim() || !count) return;
    try {
      await sendSessionNotification({
        wrapperId,
        data: {
          type: channel === "EMAIL" ? "email" : "sms",
          recipientType: audience.isAll ? "all" : "custom",
          subject,
          message: body,
          recipients: audience.isAll
            ? undefined
            : audience.users.map((u) => u.email),
        },
      }).unwrap();
      setSubject("");
      setBody("");
      setHistoryPage(1);
      toast.success(t("toast_notification_sent"));
    } catch {
      toast.error(t("toast_notification_send_error"));
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 h-[20vh]">
        <div className={CARD}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
              {t("send_message_title")}
            </h3>
          </div>
          <p
            className={clsx(
              "text-sm leading-relaxed -mt-1.5 mb-3.5",
              textTertiary,
            )}
          >
            {t("send_message_help")}
          </p>
          <AField label={t("audience_field")}>
            <ReactMultiSelect
              options={audienceOptions}
              value={audienceSelectedValues}
              onChange={handleAudienceChange}
              placeholder={t("audience_field")}
            />
          </AField>
          <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-2.5 mb-3.5">
            <button
              className={channelBtn(channel === "EMAIL")}
              onClick={() => setChannel("EMAIL")}
            >
              <strong className="text-sm">{t("channel_email_label")}</strong>
              <span className={clsx("text-[12.5px]", textTertiary)}>
                {t("channel_email_desc")}
              </span>
            </button>
            <button
              className={channelBtn(channel === "SMS")}
              onClick={() => setChannel("SMS")}
            >
              <strong className="text-sm">{t("channel_sms_label")}</strong>
              <span className={clsx("text-[12.5px]", textTertiary)}>
                {t("channel_sms_desc")}
              </span>
            </button>
          </div>
          <AField label={t("subject_field")}>
            <input
              className={INPUT}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subject_placeholder")}
            />
          </AField>
          <AField label={t("content_field")}>
            <textarea
              className={clsx(INPUT, "resize-y leading-relaxed")}
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("content_placeholder")}
            />
          </AField>
          <div className="flex items-center justify-between gap-3 mt-1.5">
            <span className={clsx("text-sm", textTertiary)}>
              {t("send_to_count", { count })}
            </span>
            <button
              className={clsx(
                "px-3.75 py-2.25 text-[13.5px] rounded-[9px] font-bold text-white hover:brightness-110 transition-[transform,filter] active:translate-y-px disabled:opacity-60 flex items-center gap-1.5",
                isDark ? "bg-blue-500" : "bg-blue-600",
              )}
              disabled={!subject.trim() || !count || isSending}
              onClick={send}
            >
              {isSending && <Loader className="w-4 h-4 animate-spin" />}
              {t("send_btn")}
            </button>
          </div>
        </div>

        <div className={CARD}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
              {t("send_history_title")}
            </h3>
          </div>
          {isHistoryInitialLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px] [&>tbody>tr:last-child>td]:border-b-0">
                <thead>
                  <tr>
                    <th className={TH}>{t("col_when")}</th>
                    <th className={TH}>{t("col_channel")}</th>
                    <th className={TH}>{t("col_audience")}</th>
                    <th className={TH}>{t("col_subject")}</th>
                    <th className={TH}>{t("col_recipients")}</th>
                    <th className={TH}>{t("col_actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: HISTORY_SKELETON_ROWS }).map(
                    (_, row) => (
                      <tr key={row} className="animate-pulse">
                        {Array.from({ length: 6 }).map((_, col) => (
                          <td key={col} className={TD}>
                            <div
                              className={clsx(
                                "h-4 rounded",
                                isDark ? "bg-gray-700" : "bg-gray-200",
                              )}
                              style={{ width: `${55 + Math.random() * 35}%` }}
                            />
                          </td>
                        ))}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : history.length === 0 ? (
            <p className={clsx("text-sm leading-relaxed", textTertiary)}>
              {t("no_messages_sent")}
            </p>
          ) : (
            <div
              ref={historyScrollRef}
              className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]"
            >
              <table className="w-full border-collapse text-[13.5px] [&>tbody>tr:last-child>td]:border-b-0">
                <thead>
                  <tr>
                    <th className={TH}>{t("col_when")}</th>
                    <th className={TH}>{t("col_channel")}</th>
                    <th className={TH}>{t("col_audience")}</th>
                    <th className={TH}>{t("col_subject")}</th>
                    <th className={TH}>{t("col_recipients")}</th>
                    <th className={TH}>{t("col_actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h._id}>
                      <td className={TD}>
                        {new Date(h.sentAt).toLocaleString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className={TD}>
                        {h.type === "email"
                          ? t("channel_email_label")
                          : t("channel_sms_label")}
                      </td>
                      <td className={TD}>
                        {h.recipientType === "all"
                          ? t("all_registrants")
                          : t("custom_recipients_label")}
                      </td>
                      <td className={TD}>{h.subject}</td>
                      <td className={TD}>{h.recipientCount}</td>
                      <td className={TD}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title={t("view_action")}
                            aria-label={t("view_action")}
                            onClick={() => setViewHistoryId(h._id)}
                            className={clsx(
                              "p-1.5 rounded-md transition-colors",
                              isDark
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100",
                            )}
                          >
                            <Eye className={clsx("w-4 h-4", textTertiary)} />
                          </button>
                          <button
                            type="button"
                            title={t("resend_action")}
                            aria-label={t("resend_action")}
                            disabled={resendingId === h._id}
                            onClick={() => handleResend(h)}
                            className={clsx(
                              "p-1.5 rounded-md transition-colors disabled:opacity-50",
                              isDark
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100",
                            )}
                          >
                            {resendingId === h._id ? (
                              <Loader
                                className={clsx(
                                  "w-4 h-4 animate-spin",
                                  textTertiary,
                                )}
                              />
                            ) : (
                              <RotateCw
                                className={clsx("w-4 h-4", textTertiary)}
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {historyPage > 1 && isHistoryFetching && (
                <div className="flex items-center justify-center py-4">
                  <Loader
                    className={clsx("w-5 h-5 animate-spin", textTertiary)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {viewHistoryId && (
        <ModalWrapper
          onClose={() => setViewHistoryId(null)}
          showSpinner={isHistoryDetailsFetching}
          height="h-auto max-h-[85dvh]"
          maxWidth="max-w-2xl"
        >
          {historyDetails && (
            <div className="p-5 pt-2 overflow-y-auto flex flex-col gap-4">
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {historyDetails.subject || t("history_detail_title")}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className={clsx("text-xs font-semibold", textTertiary)}>
                    {t("col_channel")}
                  </p>
                  <p className="m-0">
                    {historyDetails.type === "email"
                      ? t("channel_email_label")
                      : t("channel_sms_label")}
                  </p>
                </div>
                <div>
                  <p className={clsx("text-xs font-semibold", textTertiary)}>
                    {t("col_audience")}
                  </p>
                  <p className="m-0">
                    {historyDetails.recipientType === "all"
                      ? t("all_registrants")
                      : t("custom_recipients_label")}
                  </p>
                </div>
                <div>
                  <p className={clsx("text-xs font-semibold", textTertiary)}>
                    {t("detail_status_label")}
                  </p>
                  <p className="m-0">
                    {historyDetails.status === "SENT"
                      ? t("history_status_sent")
                      : historyDetails.status === "FAILED"
                        ? t("history_status_failed")
                        : t("history_status_pending")}
                  </p>
                </div>
                <div>
                  <p className={clsx("text-xs font-semibold", textTertiary)}>
                    {t("detail_sent_at_label")}
                  </p>
                  <p className="m-0">
                    {new Date(historyDetails.sentAt).toLocaleString("he-IL", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className={clsx("text-xs font-semibold", textTertiary)}>
                    {t("detail_success_label")}
                  </p>
                  <p className="m-0">{historyDetails.successCount}</p>
                </div>
                <div>
                  <p className={clsx("text-xs font-semibold", textTertiary)}>
                    {t("detail_failed_label")}
                  </p>
                  <p className="m-0">{historyDetails.failureCount}</p>
                </div>
              </div>

              {historyDetails.errorSummary && (
                <p className="m-0 text-sm text-red-500">
                  {historyDetails.errorSummary}
                </p>
              )}

              <div>
                <p className={clsx("text-xs font-semibold mb-1", textTertiary)}>
                  {t("detail_message_label")}
                </p>
                <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap">
                  {historyDetails.message}
                </p>
              </div>

              <div>
                <p
                  className={clsx("text-xs font-semibold mb-1.5", textTertiary)}
                >
                  {t("detail_recipients_label")} (
                  {historyDetails.recipients.length})
                </p>
                <div className="overflow-x-auto overflow-y-auto max-h-60">
                  <table className="w-full border-collapse text-[13px] [&>tbody>tr:last-child>td]:border-b-0">
                    <thead>
                      <tr>
                        <th className={TH}>{t("col_contact")}</th>
                        <th className={TH}>{t("detail_status_label")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyDetails.recipients.map((r, i) => (
                        <tr key={i}>
                          <td className={TD}>{r.email || r.phone}</td>
                          <td className={TD}>
                            {r.status === "sent"
                              ? t("history_status_sent")
                              : r.status === "failed"
                                ? t("history_status_failed")
                                : t("history_status_pending")}
                            {r.error && (
                              <span
                                className={clsx(
                                  "block text-xs mt-0.5",
                                  textTertiary,
                                )}
                              >
                                {r.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}
    </>
  );
}
