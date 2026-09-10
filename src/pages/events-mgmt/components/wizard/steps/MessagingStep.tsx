import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Copy,
  Trash2,
  Plus,
  PenBox,
} from "lucide-react";

import { ConfirmDialog } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import CreateNotificationWizard from "../../sub-components/CreateNotificationWizard";
import { formatLocalDateTime } from "@/helpers/formatter";

interface MessagingStepProps {
  notifications: INotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<INotificationData[]>>;
  editingNotification: INotificationData | null;
  setEditingNotification: React.Dispatch<
    React.SetStateAction<INotificationData | null>
  >;
  showNotificationForm: boolean;
  setShowNotificationForm: React.Dispatch<React.SetStateAction<boolean>>;
  eventLanguage: Language;
  capacity?: number;
  markDirty: (step: number) => void;
}

const MessagingStep: React.FC<MessagingStepProps> = ({
  markDirty,
  notifications,
  setNotifications,
  editingNotification,
  setEditingNotification,
  showNotificationForm,
  setShowNotificationForm,
  capacity,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textTertiary, isDark, isRTL, language } =
    useThemeClasses();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    number | null
  >(null);

  useEffect(() => {
    markDirty(4);
  }, [notifications, markDirty]);

  const openNewNotificationForm = () => {
    setEditingNotification({
      index: notifications.length,
      channels: ["EMAIL"],
      scheduleDateTime: "",
      subject: "",
      message: "",
      enabled: true,
      status: "ACTIVE",
    });
    setShowNotificationForm(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Section header ───────────────────────────────────────────── */}
      <div className="text-center mb-6">
        <Mail className="w-12 h-12 mx-auto mb-3 text-teal-500" />
        <h3 className={`text-xl mb-2 ${textPrimary}`}>
          {t("ticket_holder_messaging")}
        </h3>
        <p className={`text-sm ${textTertiary}`}>
          {t("ticket_holder_messaging_desc")}
        </p>
      </div>

      {/* ── Notifications list ───────────────────────────────────────── */}
      <div className="space-y-3">
        {notifications?.length > 0 ? (
          notifications?.map((notification, index) => (
            <div
              key={index}
              className={clsx(
                "p-4 rounded-lg border transition-opacity",
                isDark
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50",
                !notification.enabled && "opacity-50",
              )}
            >
              <div
                className={clsx(
                  "flex items-center justify-between",
                  isRTL && "flex-row-reverse",
                )}
              >
                {/* Left: timing + channels */}
                <div
                  className={clsx(
                    "flex items-center gap-3",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <Clock className="w-5 h-5 text-teal-500 shrink-0" />
                  <div>
                    <p className={`font-xs ${textPrimary}`}>
                      {notification.subject} |{" "}
                      {notification.sendHoursOffset != null
                        ? t(
                            notification.sendTiming === "POST_EVENT"
                              ? "send_offset_post_summary"
                              : "send_offset_pre_summary",
                            { count: notification.sendHoursOffset },
                          )
                        : formatLocalDateTime(
                            notification.scheduleDateTime,
                            language,
                          )}
                    </p>
                    <div
                      className={clsx(
                        "text-sm flex items-center gap-2 mt-0.5",
                        textTertiary,
                        isRTL && "flex-row-reverse",
                      )}
                    >
                      {notification.channels.includes("EMAIL") && (
                        <Mail className="w-4 h-4" />
                      )}
                      {notification.channels.includes("SMS") && (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-xs",
                          notification.enabled
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500",
                        )}
                      >
                        {notification.enabled ? t("active") : t("disabled")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div
                  className={clsx(
                    "flex items-center gap-1",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n, i) =>
                          i === index ? { ...n, enabled: !n.enabled } : n,
                        ),
                      )
                    }
                    className={clsx(
                      "p-2 rounded-lg transition-colors cursor-pointer",
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-200",
                    )}
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
                    className={clsx(
                      "p-2 rounded-lg transition-colors cursor-pointer",
                      isDark
                        ? "hover:bg-gray-700 text-white/60"
                        : "hover:bg-gray-200",
                    )}
                    title={t("edit")}
                  >
                    <PenBox className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setNotifications((prev) => [
                        ...prev,
                        { ...notification, index: prev.length },
                      ])
                    }
                    className={clsx(
                      "p-2 rounded-lg transition-colors cursor-pointer",
                      isDark
                        ? "hover:bg-gray-700 text-blue-400"
                        : "hover:bg-gray-200 text-blue-500",
                    )}
                    title={t("duplicate")}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setNotificationToDelete(notification.index);
                      setIsConfirmOpen(true);
                    }}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title={t("delete")}
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

        {/* ── Add notification button ───────────────────────────────── */}
        {!showNotificationForm && (
          <button
            onClick={openNewNotificationForm}
            className={clsx(
              "w-full px-4 py-3 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-2",
              isDark
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50",
              textTertiary,
            )}
          >
            <Plus className="w-5 h-5" />
            <span>{t("add_notification")}</span>
          </button>
        )}

        {/* ── Notification form (inline) ────────────────────────────── */}
        {showNotificationForm && editingNotification && (
          <CreateNotificationWizard
            t={t}
            capacity={capacity}
            notifications={notifications}
            setNotifications={setNotifications}
            setShowNotificationForm={setShowNotificationForm}
            editingNotification={editingNotification}
            setEditingNotification={setEditingNotification}
          />
        )}
      </div>

      {/* ── Delete confirmation ───────────────────────────────────────── */}
      <ConfirmDialog
        open={isConfirmOpen}
        title={t("delete_notification")}
        message={t("delete_notification_confirm")}
        confirmText={t("delete")}
        loading={false}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setNotificationToDelete(null);
        }}
        onConfirm={() => {
          if (notificationToDelete !== null) {
            setNotifications((prev) =>
              prev.filter((n) => n.index !== notificationToDelete),
            );
          }
          setIsConfirmOpen(false);
          setNotificationToDelete(null);
        }}
      />
    </div>
  );
};

export default MessagingStep;
