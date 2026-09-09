import clsx from "clsx";
import { Send } from "lucide-react";

import { AField } from "@/components/form-fields";
import { ModalWrapper } from "@/components/wrapper";
import { RichTextEditor } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatFromBackendTemplate } from "@/helpers/formatter";

interface CreateNotificationWizardProps {
  t: (key: string) => string;
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
  const isFormValid =
    hasChannel &&
    !!editingNotification.scheduleDateTime &&
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AField label={t("channel_field")} isRequired>
                <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-2.5 mb-3.5">
                  <button
                    type="button"
                    aria-pressed={channels.includes("EMAIL")}
                    className={channelBtn(channels.includes("EMAIL"))}
                    onClick={() => toggleChannel("EMAIL")}
                  >
                    <strong className={clsx("text-sm", textPrimary)}>
                      {t("channel_email_label")}
                    </strong>
                  </button>
                  <button
                    type="button"
                    aria-pressed={channels.includes("SMS")}
                    className={channelBtn(channels.includes("SMS"))}
                    onClick={() => toggleChannel("SMS")}
                  >
                    <strong className={clsx("text-sm", textPrimary)}>
                      {t("channel_sms_label")}
                    </strong>
                  </button>
                </div>
              </AField>
              <AField label={t("schedule_date_time_field")} isRequired>
                <input
                  required
                  type="datetime-local"
                  className={INPUT}
                  value={editingNotification.scheduleDateTime ?? ""}
                  onChange={(e) =>
                    setEditingNotification({
                      ...editingNotification,
                      scheduleDateTime: e.target.value,
                    })
                  }
                />
              </AField>
            </div>

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
