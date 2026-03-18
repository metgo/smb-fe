import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatFromBackendTemplate } from "@/helpers/formatter";
import { Mail, MessageSquare, Send, Smartphone } from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";
import { RichTextEditor } from "@/components/shared";

interface CreateNotificationWizardProps {
  t: (key: string) => string;
  eventName?: string;
  startDate?: string;
  eventDays?: { startTime: string }[];
  address?: string;
  capacity?: number;
  editingNotification: NotificationData | null;
  notifications: NotificationData[];
  setEditingNotification: React.Dispatch<
    React.SetStateAction<NotificationData | null>
  >;
  setShowNotificationForm: React.Dispatch<React.SetStateAction<boolean>>;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
}

const CreateNotificationWizard: React.FC<CreateNotificationWizardProps> = ({
  t,
  eventDays,
  startDate,
  eventName,
  address,
  capacity,
  notifications,
  setEditingNotification,
  editingNotification,
  setShowNotificationForm,
  setNotifications,
}) => {
  const { textPrimary, textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  if (!editingNotification) return;

  return (
    <ModalWrapper
      onClose={() => {
        setShowNotificationForm(false);
        setEditingNotification(null);
      }}
      maxWidth="max-w-3xl h-max"
    >
      <div className=" p-4">
        <h4 className={`text-lg mb-4 ${textPrimary}`}>
          {t("configure_notification")}
        </h4>

        <div
          className={clsx(
            `px-6 py-8 space-y-3 max-h-[73vh] overflow-y-auto rounded-lg border`,
            borderColor,
          )}
        >
          <div className="flex items-center gap-4">
            {/* Timing */}
            <div className="flex-1">
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("send_hours_before_event")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={editingNotification?.hoursBeforeEvent}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    hoursBeforeEvent: parseInt(e.target.value) || 1,
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Channels */}
            <div className="flex-1">
              <label className={`block text-sm ${textSecondary}`}>
                {t("channels")} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingNotification.channels.email}
                    onChange={(e) =>
                      setEditingNotification({
                        ...editingNotification,
                        channels: {
                          ...editingNotification.channels,
                          email: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  <Mail className="w-4 h-4" />
                  <span className={textSecondary}>{t("email")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingNotification.channels.sms}
                    onChange={(e) =>
                      setEditingNotification({
                        ...editingNotification,
                        channels: {
                          ...editingNotification.channels,
                          sms: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  <MessageSquare className="w-4 h-4" />
                  <span className={textSecondary}>{t("sms")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingNotification.channels.whatsapp}
                    onChange={(e) =>
                      setEditingNotification({
                        ...editingNotification,
                        channels: {
                          ...editingNotification.channels,
                          whatsapp: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  <Smartphone className="w-4 h-4" />
                  <span className={textSecondary}>{t("whatsapp")}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language */}
            <div className="flex-1">
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("language")}
              </label>
              <select
                value={editingNotification.language}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    language: e.target.value as "en" | "he" | "ar",
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="en">{t("english")}</option>
                <option value="he">{t("hebrew")}</option>
                <option value="ar">{t("arebic")}</option>
              </select>
            </div>

            {/* Template */}
            <div className="flex-1">
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("template")}
              </label>
              <select
                value={editingNotification.template}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    template: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="24h-reminder">{t("template_24h")}</option>
                <option value="same-day">{t("template_same_day")}</option>
                <option value="starting-soon">
                  {t("template_starting_soon")}
                </option>
                <option value="custom">{t("custom")}</option>
              </select>
            </div>
          </div>

          {editingNotification.template === "custom" && (
            <>
              {/* Subject */}
              <div className="">
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("subject")}
                </label>
                <input
                  type="text"
                  value={editingNotification.subject}
                  onChange={(e) =>
                    setEditingNotification({
                      ...editingNotification,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Reminder: {{Event Name}} tomorrow at {{Event Time}}"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Message Content */}
              <div className="">
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("message_content")}
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
                    { label: "Event Name", value: eventName || "Sample Event" },
                    { label: "Event Date", value: startDate || "2026-01-15" },
                    {
                      label: "Event Time",
                      value: eventDays?.[0]?.startTime || "10:00",
                    },
                    { label: "Venue", value: address || "Event Location" },
                    { label: "First Name", value: "John" },
                    { label: "Ticket QR", value: "[QR]" },
                  ]}
                />
              </div>

              <div
                className={`p-4 rounded-lg border mb-4 ${
                  isDark
                    ? "border-gray-700 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className={`text-xs ${textTertiary} mt-2`}>
                  {t("recipient_count")}: {capacity || 100}{" "}
                  {t("ticket_holders")}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => {
              setShowNotificationForm(false);
              setEditingNotification(null);
            }}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => {
              if (
                !editingNotification.channels.email &&
                !editingNotification.channels.sms &&
                !editingNotification.channels.whatsapp
              ) {
                return;
              }
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
            className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-2"
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
