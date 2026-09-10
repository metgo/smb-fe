import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { Eye, Loader, Mail, MessageSquare, RotateCw } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

import { AField } from "./AField";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ModalWrapper } from "@/components/wrapper";
import {
  useGetSendNotificationHistoryDetailsQuery,
  useGetSendNotificationHistoryQuery,
  useSendSessionNotificationMutation,
  useReSendSessionNotificationMutation,
} from "@/store/api/eventSessionApi";
import { RichTextEditor } from "@/components/shared";

const HISTORY_LIMIT = 100;
const HISTORY_SKELETON_ROWS = 12;

// The schedule picker is expressed in the EVENT's timezone (Israel), not the
// admin's browser zone — so "8:45 PM" fires at 8:45 PM Israel wherever the admin
// sits, matching the event wizard and the relative (hours-from-event) option.
// `<input type="datetime-local">` speaks naive wall-clock, so we send its value
// as-is (the backend reads it as Asia/Jerusalem) and render stored instants back
// in the same zone.
const EVENT_TZ = "Asia/Jerusalem";
const HOURS_MIN = 1;
const HOURS_MAX = 8760;

const israelNaiveNow = () =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: EVENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(" ", "T");

const formatInEventTz = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    timeZone: EVENT_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

// Empty → null; otherwise a whole number clamped to the backend's 1–8760 range.
const clampHours = (raw: string): number | null => {
  if (raw.trim() === "") return null;
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return null;
  return Math.min(HOURS_MAX, Math.max(HOURS_MIN, n));
};

interface NotifyScheduleTabProps {
  wrapperId: string | null;
}

export function NotifyScheduleTab({ wrapperId }: NotifyScheduleTabProps) {
  const { t } = useTranslation("event_session");
  const {
    isDark,
    textPrimary,
    textTertiary,
    inputClasses,
    cardClasses,
    borderColor,
  } = useThemeClasses();

  // "When" cell for a Send History row. Times are shown in the event's timezone
  // (Israel) so they match what the admin picked.
  const renderHistoryWhen = (h: INotificationHistoryItem) => {
    if (h.status === "SCHEDULED") {
      // Offset-based schedule ("24 hours before event") takes precedence over a
      // fixed wall-clock time when the backend sends one.
      const at =
        h.sendHoursOffset != null
          ? t(
              h.sendTiming === "POST_EVENT"
                ? "send_offset_post_summary"
                : "send_offset_pre_summary",
              { count: h.sendHoursOffset },
            )
          : h.scheduleDateTime
            ? formatInEventTz(h.scheduleDateTime)
            : "";
      return `${t("history_status_scheduled")}${at ? ` · ${at}` : ""}`;
    }
    if (h.status === "PENDING") return t("history_status_sending");
    const when = h.sentAt ?? h.createdAt;
    return when ? formatInEventTz(when) : "";
  };

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
      "text-start px-3.5 py-2.5 rounded-[11px] border-[1.5px] flex flex-col gap-0.5 transition-colors",
      active
        ? isDark
          ? "border-blue-400 bg-blue-950/50"
          : "border-blue-600 bg-blue-50"
        : isDark
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white",
    );

  const segBtn = (active: boolean) =>
    clsx(
      "px-3 py-2 text-xs font-semibold rounded-[8px] transition-colors whitespace-nowrap",
      active
        ? isDark
          ? "bg-blue-500 text-white"
          : "bg-blue-600 text-white"
        : isDark
          ? "text-gray-300 hover:bg-gray-700/60"
          : "text-gray-600 hover:bg-gray-200/70",
    );

  // Preset offsets (in hours) offered in the dropdown; the field also accepts
  // a freely typed number for a custom offset.
  const HOURS_OFFSET_PRESETS = [1, 3, 6, 12, 24, 48, 72];

  // Earliest selectable value for <input type="datetime-local"> — "now" in the
  // event's timezone (Israel), since the picker is read as Israel wall-clock.
  const minDateTime = israelNaiveNow();

  const [sendSessionNotification, { isLoading: isSending }] =
    useSendSessionNotificationMutation();
  const [reSendSessionNotification] = useReSendSessionNotificationMutation();

  const [channels, setChannels] = useState<Array<"EMAIL" | "SMS">>(["EMAIL"]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [hoursOffset, setHoursOffset] = useState<number | null>(null);
  const [sendTiming, setSendTiming] = useState<"PRE_EVENT" | "POST_EVENT">(
    "PRE_EVENT",
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // "offset" once an hours value is set, "exact" once a datetime is set.
  const scheduleMode: "offset" | "exact" | null =
    hoursOffset != null ? "offset" : scheduledAt ? "exact" : null;

  const setOffset = (raw: string) => {
    setHoursOffset(clampHours(raw));
    setScheduledAt("");
  };
  const pickExact = (value: string) => {
    setScheduledAt(value);
    setHoursOffset(null);
  };

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
    {
      // A freshly sent/resent row comes back PENDING with no sentAt; keep
      // refetching until it flips to SENT/FAILED so it updates without a reload.
      pollingInterval: history.some((h) => h.status === "PENDING") ? 4000 : 0,
    },
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

  function toggleChannel(value: "EMAIL" | "SMS") {
    setChannels((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  }

  const bodyIsEmpty = !body.replace(/<[^>]*>/g, "").trim();
  const hasSchedule =
    scheduleMode === "offset"
      ? (hoursOffset ?? 0) > 0
      : scheduleMode === "exact"
        ? !!scheduledAt
        : false;
  const isFormValid =
    !!wrapperId &&
    channels.length > 0 &&
    hasSchedule &&
    !!subject.trim() &&
    !bodyIsEmpty;

  async function send() {
    if (!isFormValid) {
      toast.error(t("toast_notification_send_error"));
      return;
    }
    try {
      await sendSessionNotification({
        wrapperId: wrapperId!,
        data: {
          types: channels.map((c) => (c === "EMAIL" ? "email" : "sms")),
          recipientType: "all",
          subject,
          message: body,
          // sendTiming (before/after the event) only applies to relative mode.
          ...(scheduleMode === "offset" && { sendTiming }),
          ...(scheduleMode === "offset"
            ? { sendHoursOffset: hoursOffset ?? HOURS_MIN }
            : // Send the picker's naive wall-clock string as-is — the backend
              // reads it as the event's timezone (Israel). Do NOT toISOString().
              { scheduleDateTime: scheduledAt }),
        },
      }).unwrap();
      setSubject("");
      setBody("");
      setScheduledAt("");
      setHoursOffset(null);
      setSendTiming("PRE_EVENT");
      setHistoryPage(1);
      toast.success(t("toast_notification_sent"));
    } catch {
      toast.error(t("toast_notification_send_error"));
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4.5">
        <div className={clsx(CARD, "flex flex-col")}>
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

          {/* Fields  */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <AField label={t("channel_field")} isRequired>
              <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-2.5 mb-3.5">
                <button
                  type="button"
                  aria-pressed={channels.includes("EMAIL")}
                  className={channelBtn(channels.includes("EMAIL"))}
                  onClick={() => toggleChannel("EMAIL")}
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <strong className="text-sm">
                      {t("channel_email_label")}
                    </strong>
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={channels.includes("SMS")}
                  className={channelBtn(channels.includes("SMS"))}
                  onClick={() => toggleChannel("SMS")}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <strong className="text-sm">
                      {t("channel_sms_label")}
                    </strong>
                  </span>
                </button>
              </div>
            </AField>

            <AField label={t("schedule_date_time_field")} isRequired>
              <div className="flex flex-wrap items-stretch gap-2">
                {/* Before / after the event — applies to either "when" */}
                <div
                  className={clsx(
                    "flex gap-1 p-1 rounded-[10px] border shrink-0",
                    isDark
                      ? "border-gray-700 bg-gray-800/60"
                      : "border-gray-200 bg-gray-100/70",
                  )}
                >
                  <button
                    type="button"
                    className={segBtn(sendTiming === "PRE_EVENT")}
                    onClick={() => setSendTiming("PRE_EVENT")}
                  >
                    {t("send_timing_pre_event")}
                  </button>
                  <button
                    type="button"
                    className={segBtn(sendTiming === "POST_EVENT")}
                    onClick={() => setSendTiming("POST_EVENT")}
                  >
                    {t("send_timing_post_event")}
                  </button>
                </div>

                {/* Hours offset: preset dropdown that also accepts a typed value */}
                <div className="relative flex-1 min-w-35">
                  <input
                    type="number"
                    min={HOURS_MIN}
                    max={HOURS_MAX}
                    step={1}
                    list="session-notif-hours-offset-presets"
                    className={clsx(
                      INPUT,
                      "pr-14",
                      scheduleMode === "offset" &&
                        (isDark ? "border-blue-400" : "border-blue-500"),
                    )}
                    placeholder={t("schedule_offset_custom_placeholder")}
                    value={hoursOffset ?? ""}
                    onChange={(e) => setOffset(e.target.value)}
                  />
                  <datalist id="session-notif-hours-offset-presets">
                    {HOURS_OFFSET_PRESETS.map((h) => (
                      <option key={h} value={h}>
                        {t("hours_count", { count: h })}
                      </option>
                    ))}
                  </datalist>
                  <span
                    className={clsx(
                      "pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs",
                      isDark ? "text-gray-500" : "text-gray-400",
                    )}
                  >
                    {t("hours_unit")}
                  </span>
                </div>

                <span
                  className={clsx(
                    "shrink-0 self-center text-[11px] uppercase tracking-wide font-semibold",
                    isDark ? "text-gray-500" : "text-gray-400",
                  )}
                >
                  {t("schedule_offset_or_exact")}
                </span>

                {/* Or an exact date & time */}
                <input
                  type="datetime-local"
                  min={minDateTime}
                  className={clsx(
                    INPUT,
                    "flex-1 min-w-50",
                    scheduleMode === "exact" &&
                      (isDark ? "border-blue-400" : "border-blue-500"),
                  )}
                  value={scheduledAt}
                  onChange={(e) => pickExact(e.target.value)}
                />
              </div>
              <span
                className={clsx(
                  "text-[11px] font-medium",
                  isDark ? "text-gray-500" : "text-gray-400",
                )}
              >
                {t(
                  "schedule_timezone_hint",
                  "Times are in Israel time (Asia/Jerusalem) — the event's timezone.",
                )}
              </span>
            </AField>

            <AField label={t("subject_field")} isRequired>
              <input
                className={INPUT}
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("subject_placeholder")}
              />
            </AField>

            <label className="flex flex-col gap-1.5 mb-1 last:mb-0">
              <span className={clsx("text-[12.5px] font-bold", textPrimary)}>
                {t("content_field")}
                <span className="text-red-500">*</span>
              </span>
            </label>

            <RichTextEditor
              value={body}
              onChange={(v) => setBody(v)}
              variables={[
                { label: t("var_session_name"), value: `{SESSION_NAME}` },
                { label: t("var_session_date"), value: `{SESSION_DATE}` },
                { label: t("var_session_time"), value: `{SESSION_TIME}` },
                { label: t("var_venue"), value: `{VENUE}` },
                { label: t("var_first_name"), value: `{FIRST_NAME}` },
                { label: t("var_ref_code"), value: `{REF_CODE}` },
                { label: t("var_qr"), value: `{QR}` },
              ]}
            />

            <div className="flex items-center justify-between gap-3 mt-1.5">
              <button
                className={clsx(
                  "px-3.75 py-2.25 text-[13.5px] rounded-[9px] font-bold text-white hover:brightness-110 transition-[transform,filter] active:translate-y-px disabled:opacity-60 flex items-center gap-1.5",
                  isDark ? "bg-blue-500" : "bg-blue-600",
                )}
                disabled={!isFormValid || isSending}
                onClick={send}
              >
                {isSending && <Loader className="w-4 h-4 animate-spin" />}
                {t("send_btn")}
              </button>
            </div>
          </div>
        </div>

        <div className={CARD}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
              {t("notification_schedule_title")}
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
                      <td className={TD}>{renderHistoryWhen(h)}</td>
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
          height=" min-h-[40vh] max-h-[85dvh]"
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
                    {historyDetails.sentAt
                      ? formatInEventTz(historyDetails.sentAt)
                      : "—"}
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
