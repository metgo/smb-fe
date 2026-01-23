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
} from "lucide-react";
import { Activity, useEffect, useState } from "react";
import CreateNotificationWizard from "./CreateNotificationWizard";
import { ConfirmDialog } from "@/components/shared";


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
  markDirty: (step: number) => void;
}

const NotificationsTimeline: React.FC<NotificationsTimelineProps> = ({
  markDirty,
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
  const { textPrimary, textTertiary } = useThemeClasses();
  const { isRTL, theme } = useAppSelector((state) => state.settings);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);


  useEffect(() => {
    markDirty(5)
  }, [
    notifications,
    eventLanguage,
    eventName,
    startDate,
    eventDays,
    address,
    capacity
  ])
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
                key={notification._id}
                className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"} ${!notification.enabled ? "opacity-50" : ""
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
                          className={`px-2 py-0.5 rounded text-xs ${notification.enabled
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
                          prev.map((n) => (n._id === notification._id ? { ...n, enabled: !n.enabled } : n))
                        );
                      }}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
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
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const duplicated: NotificationData = {
                          ...notification,
                          _id: Date.now().toString(),
                        };
                        setNotifications((prev) => [...prev, duplicated]);
                      }}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setNotificationToDelete(notification._id)
                        setIsConfirmOpen(true)
                      }}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                _id: Date.now().toString(),
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
            className={`w-full px-4 py-3 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"
              }`}
          >
            <Plus className="w-5 h-5" />
            <span>{t("add_notification")}</span>
          </button>
        )}

        {/* Notification Configuration Form */}
        <Activity mode={showNotificationForm && editingNotification ? "visible" : "hidden"}>
          <CreateNotificationWizard
            t={t}
            theme={theme}
            eventName={eventName}
            startDate={startDate}
            eventDays={eventDays}
            address={address}
            capacity={capacity}
            notifications={notifications}
            setNotifications={setNotifications}
            setShowNotificationForm={setShowNotificationForm}
            editingNotification={editingNotification}
            setEditingNotification={setEditingNotification}
          />
        </Activity>

      </div>


      <ConfirmDialog
        open={isConfirmOpen}
        title="delete_notification"
        message="delete_notification_confirm"
        confirmText="delete"
        loading={false}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setNotificationToDelete(null);
        }}
        onConfirm={async () => {
          if (!notificationToDelete) return;

          setNotifications((prev) => prev.filter((n) => n._id !== notificationToDelete));

          setIsConfirmOpen(false);
          setNotificationToDelete(null);
        }}
      />
    </div>
  );
};

export default NotificationsTimeline;