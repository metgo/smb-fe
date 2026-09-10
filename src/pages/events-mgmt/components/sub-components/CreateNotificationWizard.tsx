import clsx from "clsx";
import { Mail, MessageSquare, Send } from "lucide-react";

import { AField } from "@/components/form-fields";
import { ModalWrapper } from "@/components/wrapper";
import { RichTextEditor } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatFromBackendTemplate } from "@/helpers/formatter";

// The schedule picker is expressed in the EVENT's timezone (Israel), not the
// admin's browser zone — "8:45 PM" fires at 8:45 PM Israel wherever the admin
// sits. `<input type="datetime-local">` speaks naive wall-clock, so its value is
// sent as-is (the backend reads it as Asia/Jerusalem).
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

// Empty → undefined; otherwise a whole number clamped to the backend 1–8760.
const clampHours = (raw: string): number | undefined => {
  if (raw.trim() === "") return undefined;
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return undefined;
  return Math.min(HOURS_MAX, Math.max(HOURS_MIN, n));
};

interface CreateNotificationWizardProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  capacity?: number;
  editingNotification: INotificationData | null;
  notifications: INotificationData[];
  setEditingNotification: React.Dispatch<
    React.SetStateAction<INotificationData | null>
  >;
  setShowNotificationForm: React.Dispatch<React.SetStateAction<boolean>>;
  setNotifications: React.Dispatch<React.SetStateAction<INotificationData[]>>;
}

const CreateNotificationWizard: React.FC<CreateNotificationWizardProps> = ({
  t,
  notifications,
  setEditingNotification,
  editingNotification,
  setShowNotificationForm,
  setNotifications,
}) => {
  const { textPrimary, borderColor, hoverBg, bgPrimary, isDark, inputClasses } =
    useThemeClasses();

  if (!editingNotification) return;

  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2 border",
    inputClasses,
    isDark
      ? "focus:border-blue-400 focus:ring-blue-400/10 [color-scheme:dark]"
      : "focus:border-blue-500 focus:ring-blue-500/10",
  );

  // Earliest selectable value for <input type="datetime-local"> — "now" in the
  // event's timezone (Israel), since the picker is read as Israel wall-clock.
  const minDateTime = israelNaiveNow();

  // Preset offsets (in hours) offered in the dropdown; the field also accepts
  // a freely typed number for a custom offset.
  const HOURS_OFFSET_PRESETS = [1, 3, 6, 12, 24, 48, 72];
  const { sendHoursOffset, sendTiming, scheduleDateTime } = editingNotification;
  // "offset" once an hours value is set, "exact" once a datetime is set,
  // otherwise nothing is chosen yet.
  const scheduleMode: "offset" | "exact" | null =
    sendHoursOffset != null ? "offset" : scheduleDateTime ? "exact" : null;

  // sendTiming (before / after the event) applies whichever way the "when"
  // is expressed, so it lives on its own and defaults to PRE_EVENT.
  const timing = sendTiming ?? "PRE_EVENT";
  const setTiming = (value: "PRE_EVENT" | "POST_EVENT") =>
    setEditingNotification({ ...editingNotification, sendTiming: value });

  const setOffset = (raw: string) =>
    setEditingNotification({
      ...editingNotification,
      scheduleDateTime: "",
      sendHoursOffset: clampHours(raw),
      sendTiming: timing,
    });

  const pickExact = (value: string) =>
    setEditingNotification({
      ...editingNotification,
      scheduleDateTime: value,
      sendHoursOffset: undefined,
      sendTiming: timing,
    });

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

  const toggleChannel = (channel: "EMAIL" | "SMS") =>
    setEditingNotification({
      ...editingNotification,
      channels: editingNotification.channels.includes(channel)
        ? editingNotification.channels.filter((c) => c !== channel)
        : [...editingNotification.channels, channel],
    });

  const { channels } = editingNotification;
  const hasChannel = channels.length > 0;
  const messageIsEmpty = !editingNotification.message
    .replace(/<[^>]*>/g, "")
    .trim();
  const hasSchedule =
    scheduleMode === "offset"
      ? (sendHoursOffset ?? 0) > 0
      : scheduleMode === "exact"
        ? !!scheduleDateTime
        : false;
  const isFormValid =
    hasChannel &&
    hasSchedule &&
    !!editingNotification.subject.trim() &&
    !messageIsEmpty;

  return (
    <ModalWrapper
      onClose={() => {
        setShowNotificationForm(false);
        setEditingNotification(null);
      }}
      maxWidth="max-w-3xl"
      height="h-max"
    >
      <div className={clsx("p-4", bgPrimary)}>
        <h4 className={`text-lg mb-4 ${textPrimary}`}>
          {t("configure_notification")}
        </h4>

        <div
          className={clsx(
            `px-6 py-8 space-y-3 max-h-[73vh] overflow-y-auto rounded-lg border`,
            borderColor,
            bgPrimary,
          )}
        >
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
                    <Mail className={clsx("w-4 h-4", textPrimary)} />
                    <strong className={clsx("text-sm", textPrimary)}>
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
                    <MessageSquare className={clsx("w-4 h-4", textPrimary)} />
                    <strong className={clsx("text-sm", textPrimary)}>
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
                    className={segBtn(timing === "PRE_EVENT")}
                    onClick={() => setTiming("PRE_EVENT")}
                  >
                    {t("send_timing_pre_event")}
                  </button>
                  <button
                    type="button"
                    className={segBtn(timing === "POST_EVENT")}
                    onClick={() => setTiming("POST_EVENT")}
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
                    list="notif-hours-offset-presets"
                    className={clsx(
                      INPUT,
                      "pr-14",
                      scheduleMode === "offset" &&
                        (isDark ? "border-blue-400" : "border-blue-500"),
                    )}
                    placeholder={t("schedule_offset_custom_placeholder")}
                    value={sendHoursOffset ?? ""}
                    onChange={(e) => setOffset(e.target.value)}
                  />
                  <datalist id="notif-hours-offset-presets">
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
                  value={scheduleDateTime ?? ""}
                  onChange={(e) => pickExact(e.target.value)}
                />
              </div>
              <span
                className={clsx(
                  "text-[11px] font-medium",
                  isDark ? "text-gray-500" : "text-gray-400",
                )}
              >
                {t("schedule_timezone_hint", {
                  defaultValue:
                    "Times are in Israel time (Asia/Jerusalem) — the event's timezone.",
                })}
              </span>
            </AField>

            <AField label={t("subject_field")} isRequired>
              <input
                className={INPUT}
                required
                value={editingNotification.subject}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    subject: e.target.value,
                  })
                }
                placeholder={t("subject_placeholder")}
              />
            </AField>

            <label className="flex flex-col gap-1.5 mb-1 last:mb-0">
              <span className={clsx("text-[12.5px] font-bold", textPrimary)}>
                {t("content_field")}
                <span className="text-red-500"> *</span>
              </span>
            </label>

            <RichTextEditor
              value={formatFromBackendTemplate(editingNotification.message)}
              onChange={(v) =>
                setEditingNotification({
                  ...editingNotification,
                  message: v,
                })
              }
              variables={[
                { label: t("var_event_name"), value: "{EVENT_NAME}" },
                { label: t("var_event_date"), value: "{EVENT_DATE}" },
                { label: t("var_event_time"), value: "{EVENT_TIME}" },
                { label: t("var_venue"), value: "{VENUE}" },
                { label: t("var_first_name"), value: "{FIRST_NAME}" },
                { label: t("var_ticket_qr"), value: "{QR}" },
              ]}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => {
              setShowNotificationForm(false);
              setEditingNotification(null);
            }}
            className={clsx(
              "px-4 py-2 rounded-lg border transition-colors cursor-pointer",
              borderColor,
              hoverBg,
              textPrimary,
            )}
          >
            {t("cancel")}
          </button>
          <button
            disabled={!isFormValid}
            onClick={() => {
              if (!isFormValid) return;
              const existingIndex = notifications.findIndex(
                (n) => n._id === editingNotification._id,
              );
              if (existingIndex >= 0) {
                const updated = [...notifications];
                updated[existingIndex] = editingNotification;
                setNotifications(updated);
              } else {
                setNotifications([...notifications, editingNotification]);
              }
              setShowNotificationForm(false);
              setEditingNotification(null);
            }}
            className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
            {t("save_notification")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateNotificationWizard;
