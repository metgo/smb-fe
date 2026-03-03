import {
  Info,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Settings,
  CheckCheck,
} from "lucide-react";
import { Theme } from "../App";
import { useLanguage } from "../contexts/LanguageContext";

interface Notification {
  id: string;
  type: "info" | "action" | "warning" | "error";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationsDropdownProps {
  theme: Theme;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
  isRTL: boolean;
}

export default function NotificationsDropdown({
  theme,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  isRTL,
}: NotificationsDropdownProps) {
  const { t } = useLanguage();

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "info":
        return <Info className={`${iconClass} text-blue-500`} />;
      case "action":
        return <AlertCircle className={`${iconClass} text-purple-500`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case "error":
        return <XCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Info className={`${iconClass} text-gray-500`} />;
    }
  };

  const getBorderColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return isRTL ? "border-r-blue-500" : "border-l-blue-500";
      case "action":
        return isRTL ? "border-r-purple-500" : "border-l-purple-500";
      case "warning":
        return isRTL ? "border-r-yellow-500" : "border-l-yellow-500";
      case "error":
        return isRTL ? "border-r-red-500" : "border-l-red-500";
      default:
        return isRTL ? "border-r-gray-500" : "border-l-gray-500";
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t.justNow || "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${t.minutesAgo || "minutes ago"}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${t.hoursAgo || "hours ago"}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${t.daysAgo || "days ago"}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-[420px] max-w-[calc(100vw-2rem)] ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      } rounded-xl border ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      } shadow-2xl overflow-hidden z-50`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gray-50"
        } flex items-center justify-between`}
      >
        <h3
          className={`font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {t.notifications || "Notifications"}
          {unreadCount > 0 && (
            <span
              className={`${isRTL ? "mr-2" : "ml-2"} text-sm font-normal ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              ({unreadCount} {t.unread || "unread"})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAllAsRead();
              }}
              className={`text-xs px-2 py-1 rounded-md ${
                theme === "dark"
                  ? "text-teal-400 hover:bg-gray-700"
                  : "text-teal-600 hover:bg-gray-100"
              } transition-colors flex items-center gap-1`}
              title={t.markAllAsRead || "Mark all as read"}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t.markAllRead || "Mark all read"}
              </span>
            </button>
          )}
          <button
            className={`p-1.5 rounded-md ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            } transition-colors`}
            title={t.notificationSettings || "Settings"}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body - Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          // Empty State
          <div className="py-12 px-4 text-center">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              } flex items-center justify-center`}
            >
              <CheckCheck
                className={`w-8 h-8 ${
                  theme === "dark" ? "text-gray-600" : "text-gray-400"
                }`}
              />
            </div>
            <h4
              className={`mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {t.allCaughtUp || "You're all caught up"}
            </h4>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t.noNewNotifications || "No new notifications"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.slice(0, 5).map((notification) => (
              <button
                key={notification.id}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                  onNotificationClick(notification);
                }}
                className={`w-full px-4 py-3 text-${isRTL ? "right" : "left"} ${
                  theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
                } transition-colors border-${isRTL ? "r" : "l"}-2 ${getBorderColor(
                  notification.type,
                )} ${
                  !notification.read
                    ? theme === "dark"
                      ? "bg-gray-800/50"
                      : "bg-blue-50/50"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        } line-clamp-1`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      } line-clamp-2 mb-1`}
                    >
                      {notification.description}
                    </p>
                    <span
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {getRelativeTime(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Show more indicator if there are more than 5 notifications */}
        {notifications.length > 5 && (
          <div
            className={`px-4 py-2 text-center text-sm ${
              theme === "dark"
                ? "text-gray-400 bg-gray-800/50"
                : "text-gray-500 bg-gray-50"
            }`}
          >
            +{notifications.length - 5} {t.more || "more"}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          className={`px-4 py-3 border-t ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <button
            onClick={onViewAll}
            className={`w-full py-2 px-4 text-sm font-medium rounded-lg ${
              theme === "dark"
                ? "text-teal-400 hover:bg-gray-700"
                : "text-teal-600 hover:bg-gray-100"
            } transition-colors`}
          >
            {t.viewAllNotifications || "View all notifications"}
          </button>
        </div>
      )}
    </div>
  );
}
