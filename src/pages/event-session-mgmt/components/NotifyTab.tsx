import clsx from "clsx";
import { useState } from "react";
import { AField } from "./AField";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface SendLogEntry {
  at: number;
  channel: "EMAIL" | "SMS";
  subject: string;
  count: number;
  audience: string;
}

interface NotifyTabProps {
  config: IAdminConfig;
  records: IBookingRecord[];
}

export function NotifyTab({ config, records }: NotifyTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, inputClasses, cardClasses, borderColor } =
    useThemeClasses();

  const CARD = clsx(cardClasses, "rounded-[14px] p-5");
  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2",
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

  const [audience, setAudience] = useState<string>("all");
  const [channel, setChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [log, setLog] = useState<SendLogEntry[]>([]);

  const liveEvents = config.sessions
    .map((s, i) => ({ ...s, idx: String(i) }))
    .filter((s) => config.liveEventIds.includes(s.idx));
  const recipients = records.filter(
    (r) => audience === "all" || r.eventId === audience,
  );
  const count = new Set(recipients.map((r) => r.email)).size;

  function send() {
    if (!subject.trim() || !count) return;
    setLog((l) => [
      {
        at: Date.now(),
        channel,
        subject,
        count,
        audience:
          audience === "all"
            ? t("all_registrants")
            : (liveEvents.find((e) => e.idx === audience)?.name ?? ""),
      },
      ...l,
    ]);
    setSubject("");
    setBody("");
  }

  return (
    <div className="flex flex-col gap-4.5 max-w-155 mx-auto">
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
          <select
            className={INPUT}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="all">{t("all_registrants")}</option>
            {liveEvents.map((e) => (
              <option key={e.idx} value={e.idx}>
                {e.name}
              </option>
            ))}
          </select>
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
              "px-3.75 py-2.25 text-[13.5px] rounded-[9px] font-bold text-white hover:brightness-110 transition-[transform,filter] active:translate-y-px disabled:opacity-60",
              isDark ? "bg-blue-500" : "bg-blue-600",
            )}
            disabled={!subject.trim() || !count}
            onClick={send}
          >
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
        {log.length === 0 ? (
          <p className={clsx("text-sm leading-relaxed", textTertiary)}>
            {t("no_messages_sent")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px] [&>tbody>tr:last-child>td]:border-b-0">
              <thead>
                <tr>
                  <th className={TH}>{t("col_when")}</th>
                  <th className={TH}>{t("col_channel")}</th>
                  <th className={TH}>{t("col_audience")}</th>
                  <th className={TH}>{t("col_subject")}</th>
                  <th className={TH}>{t("col_recipients")}</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l, i) => (
                  <tr key={i}>
                    <td className={TD}>
                      {new Date(l.at).toLocaleString("he-IL", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className={TD}>
                      {l.channel === "EMAIL"
                        ? t("channel_email_label")
                        : t("channel_sms_label")}
                    </td>
                    <td className={TD}>{l.audience}</td>
                    <td className={TD}>{l.subject}</td>
                    <td className={TD}>{l.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
