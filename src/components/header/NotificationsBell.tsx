import clsx from "clsx";
import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BellIcon,
  Info,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toggleNotification } from "@/features/uiSlice";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { generateMockNotifications } from "@/lib/notifications";
import { useTranslation } from "react-i18next";

interface Notification {
  id: string;
  type: "info" | "action" | "warning" | "error";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  relatedTo?: {
    module: string;
    id: string;
  };
}

const NotificationsBell = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("common");

  const { isRTL, isDark, textPrimary, textSecondary, textTertiary, hoverBg } =
    useThemeClasses();
  const navigate = useNavigate();

  const { isNotificationOpen } = useAppSelector((state) => state.ui);
  const [notifications] = useState<any[]>(generateMockNotifications());

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
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t("just_now") || "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${t("minutesAgo") || "minutes ago"}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${t("hoursAgo") || "hours ago"}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${t("daysAgo") || "days ago"}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => dispatch(toggleNotification())}
        className={clsx(
          "p-2 rounded-lg border transition-colors cursor-pointer",
          isDark
            ? "border-gray-700 hover:bg-gray-800"
            : "border-gray-300 hover:bg-gray-100 bg-gray-50",
        )}
        aria-label="Notifications"
      >
        <BellIcon className={clsx("w-5 h-5", textPrimary)} />
      </button>

      {/*  Notification Popup */}
      {isNotificationOpen && (
        <div
          className={clsx(
            "absolute right-0 mt-2 w-96 max-h-100 overflow-y-auto rounded-xl shadow-xl border z-50 flex flex-col",
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <>
              <div className="py-4 px-4 font-semibold bg-gray-50 border-b">
                Notifications
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 flex-1 overflow-y-auto">
                {notifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-4 ${hoverBg} transition-colors border-${isRTL ? "r" : "l"}-2 ${getBorderColor(notification.type)} ${!notification.read ? (isDark ? "bg-gray-800/50" : "bg-blue-50/50") : ""}`}
                  >
                    {" "}
                    {/* Icon */}{" "}
                    <div className="shrink-0 mt-0.5">
                      {" "}
                      {getNotificationIcon(notification.type)}{" "}
                    </div>{" "}
                    {/* Content */}{" "}
                    <button
                      className={`flex-1 min-w-0 text-${isRTL ? "right" : "left"}`}
                    >
                      {" "}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        {" "}
                        <h4 className={`text-sm font-medium ${textPrimary}`}>
                          {" "}
                          {notification.title}{" "}
                        </h4>{" "}
                        {!notification.read && (
                          <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                        )}{" "}
                      </div>{" "}
                      <p className={`text-sm ${textSecondary} mb-1`}>
                        {" "}
                        {notification.description}{" "}
                      </p>{" "}
                      <span className={`text-xs ${textTertiary}`}>
                        {" "}
                        {getRelativeTime(notification.timestamp)}{" "}
                      </span>{" "}
                    </button>{" "}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/notifications-management")}
                className="w-full p-3 text-sm font-semibold text-center text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-b-xl"
              >
                View All Notifications
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
