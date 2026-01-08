import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Clock,
  MessageSquare,
  Smartphone,
  CheckCircle,
  XCircle,
  FileText,
  Copy,
  Trash2,
  Plus,
  Send,
} from "lucide-react";


interface NotificationsTimelineProps {
  notifications: NotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
  editingNotification: NotificationData | null;
  setEditingNotification: React.Dispatch<React.SetStateAction<NotificationData | null>>;
  showNotificationForm: boolean;
  setShowNotificationForm: React.Dispatch<React.SetStateAction<boolean>>;
  eventLanguage: "en" | "he" | "ar";
  eventName?: string;
  startDate?: string;
  eventDays?: { startTime: string }[];
  address?: string;
  capacity?: number;
}

const NotificationsTimeline: React.FC<NotificationsTimelineProps> = ({
  notifications,
  setNotifications,
  editingNotification,
  setEditingNotification,
  showNotificationForm,
  setShowNotificationForm,
  eventLanguage,
  eventName,
  startDate,
  eventDays,
  address,
  capacity,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textTertiary, textSecondary } = useThemeClasses();
  const { isRTL, theme } = useAppSelector((state) => state.settings);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <Mail className="w-12 h-12 mx-auto mb-3 text-teal-500" />
        <h3 className={`text-xl mb-2 ${textPrimary}`}>
          {t("ticket_holder_messaging")}
        </h3>
        <p className={`text-sm ${textTertiary}`}>
          {t("ticket_holder_messaging_desc")}
        </p>
      </div>

      {/* Notifications Timeline */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications
            .sort((a, b) => a.hoursBeforeEvent - b.hoursBeforeEvent)
            .map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"} ${
                  !notification.enabled ? "opacity-50" : ""
                }`}
              >
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Clock className="w-5 h-5 text-teal-500" />
                    <div>
                      <div className={`${textPrimary} font-medium`}>
                        {notification.hoursBeforeEvent} {t("hours_before_event")}
                      </div>
                      <div className={`text-sm ${textTertiary} flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        {notification.channels.email && <Mail className="w-4 h-4" />}
                        {notification.channels.sms && <MessageSquare className="w-4 h-4" />}
                        {notification.channels.whatsapp && <Smartphone className="w-4 h-4" />}
                        <span>• {notification.language.toUpperCase()}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            notification.enabled
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {notification.enabled ? t("active") : t("disabled")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <button
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notification.id ? { ...n, enabled: !n.enabled } : n))
                        );
                      }}
                      className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                      title={notification.enabled ? t("disable") : t("enable")}
                    >
                      {notification.enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotification(notification);
                        setShowNotificationForm(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const duplicated: NotificationData = {
                          ...notification,
                          id: Date.now().toString(),
                        };
                        setNotifications((prev) => [...prev, duplicated]);
                      }}
                      className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t("confirm_delete"))) {
                          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                        }
                      }}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className={`text-center py-12 ${textTertiary}`}>
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>{t("no_notifications_yet")}</p>
          </div>
        )}

        {/* Add Notification Button */}
        {!showNotificationForm && (
          <button
            onClick={() => {
              setEditingNotification({
                id: Date.now().toString(),
                hoursBeforeEvent: 24,
                channels: { email: true, sms: false, whatsapp: false },
                language: eventLanguage,
                template: "24h-reminder",
                subject: "",
                message: "",
                enabled: true,
              });
              setShowNotificationForm(true);
            }}
            className={`w-full px-4 py-3 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
              theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>{t("add_notification")}</span>
          </button>
        )}

        {/* Notification Configuration Form */}
        {showNotificationForm && editingNotification && (
          <div
            className={`p-6 rounded-lg border ${
              theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <h4 className={`text-lg mb-4 ${textPrimary}`}>{t("configure_notification")}</h4>

            {/* Timing */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("send_hours_before_event")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={editingNotification.hoursBeforeEvent}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    hoursBeforeEvent: parseInt(e.target.value) || 1,
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Channels */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${textSecondary}`}>
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
                        channels: { ...editingNotification.channels, email: e.target.checked },
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
                        channels: { ...editingNotification.channels, sms: e.target.checked },
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
                        channels: { ...editingNotification.channels, whatsapp: e.target.checked },
                      })
                    }
                    className="rounded"
                  />
                  <Smartphone className="w-4 h-4" />
                  <span className={textSecondary}>{t("whatsapp")}</span>
                </label>
              </div>
            </div>

            {/* Language */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${textSecondary}`}>{t("language")}</label>
              <select
                value={editingNotification.language}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    language: e.target.value as "en" | "he" | "ar",
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="en">{t("english")}</option>
                <option value="he">{t("hebrew")}</option>
                <option value="ar">{t("arabic")}</option>
              </select>
            </div>

            {/* Template */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${textSecondary}`}>{t("template")}</label>
              <select
                value={editingNotification.template}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    template: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="24h-reminder">{t("template_24h")}</option>
                <option value="same-day">{t("template_same_day")}</option>
                <option value="starting-soon">{t("template_starting_soon")}</option>
              </select>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                {t("subject")} ({t("email_only")})
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
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Message Content */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${textSecondary}`}>{t("message_content")}</label>
              <textarea
                value={editingNotification.message}
                onChange={(e) =>
                  setEditingNotification({
                    ...editingNotification,
                    message: e.target.value,
                  })
                }
                placeholder="Hi {{First Name}},\n\nThis is a reminder that {{Event Name}} is happening tomorrow at {{Event Time}}!\n\nVenue: {{Venue}}\n\nYour ticket: {{Ticket QR}}"
                rows={6}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <p className={`text-xs ${textTertiary} mt-2`}>
                {t("available_variables")}: {"{{ Event Name }}"}, {"{{ Event Date }}"}, {"{{ Event Time }}"}, {"{{ Venue }}"}, {"{{ First Name }}"}, {"{{ Ticket QR }}"}
              </p>
            </div>

            {/* Preview */}
            <div
              className={`p-4 rounded-lg border mb-4 ${
                theme === "dark" ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-white"
              }`}
            >
              <div className={`text-sm ${textTertiary} mb-2`}>{t("preview")}:</div>
              <div className={`text-sm ${textSecondary}`}>
                {editingNotification.message.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
                  const mockData: Record<string, string> = {
                    "Event Name": eventName || "Sample Event",
                    "Event Date": startDate || "2026-01-15",
                    "Event Time": eventDays?.[0]?.startTime || "10:00",
                    Venue: address || "Event Location",
                    "First Name": "John",
                    "Ticket QR": "[QR Code]",
                  };
                  return mockData[key.trim()] || key;
                })}
              </div>
              <div className={`text-xs ${textTertiary} mt-2`}>
                {t("recipient_count")}: {capacity || 100} {t("ticket_holders")}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNotificationForm(false);
                  setEditingNotification(null);
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => {
                  if (!editingNotification.channels.email && !editingNotification.channels.sms && !editingNotification.channels.whatsapp) {
                    alert(t("select_at_least_one_channel"));
                    return;
                  }
                  const existingIndex = notifications.findIndex((n) => n.id === editingNotification.id);
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
        )}
      </div>
    </div>
  );
};

export default NotificationsTimeline;