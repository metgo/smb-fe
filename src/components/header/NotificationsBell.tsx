import clsx from "clsx";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Info,
  XCircle,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getBorderColor, timeAgo } from "@/helpers";
import { toggleNotification } from "@/features/uiSlice";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { itemEndpoint } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { useMarkNotificationsAsReadMutation } from "@/store/api/notificationApi";

const NotificationsBell = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("notifications");
  const popupRef = useRef<HTMLDivElement>(null);

  const { isNotificationOpen } = useAppSelector((state) => state.ui);
  const { notifications } = useAppSelector((state) => state.notification);

  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();

  const { isRTL, isDark, textPrimary, textSecondary, textTertiary, language } =
    useThemeClasses();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const getNotificationIcon = (type: TNotifType) => {
    const base =
      "w-8 h-8 rounded-full flex items-center justify-center shrink-0";
    switch (type) {
      case "INFO":
        return (
          <span className={`${base} bg-blue-100 dark:bg-blue-900/40`}>
            <Info className="w-4 h-4 text-blue-500" />
          </span>
        );
      case "ACTION":
        return (
          <span className={`${base} bg-purple-100 dark:bg-purple-900/40`}>
            <AlertCircle className="w-4 h-4 text-purple-500" />
          </span>
        );
      case "WARNING":
        return (
          <span className={`${base} bg-amber-100 dark:bg-amber-900/40`}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </span>
        );
      case "ERROR":
        return (
          <span className={`${base} bg-red-100 dark:bg-red-900/40`}>
            <XCircle className="w-4 h-4 text-red-500" />
          </span>
        );
    }
  };

  const handleViewAllNotification = () => {
    dispatch(toggleNotification());
    navigate(routes.notificationMgmt);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isNotificationOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        dispatch(toggleNotification());
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen, dispatch]);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => dispatch(toggleNotification())}
        aria-label="Notifications"
        className={clsx(
          "relative p-2 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          isDark
            ? "border-gray-700 hover:bg-gray-800 bg-gray-900"
            : "border-gray-200 hover:bg-gray-100 bg-white shadow-sm",
        )}
      >
        <Bell className={clsx("w-5 h-5", textPrimary)} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className={clsx(
              "absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1",
              "rounded-full bg-red-500 text-white text-[10px] font-bold",
              "flex items-center justify-center leading-none",
              "ring-2",
              isDark ? "ring-gray-900" : "ring-white",
              "animate-pulse-once",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isNotificationOpen && (
        <div
          ref={popupRef}
          className={clsx(
            "absolute mt-2.5 w-95 rounded-2xl shadow-2xl border z-50 flex flex-col overflow-hidden",
            "animate-fade-in",
            isDark
              ? "bg-gray-900 border-gray-700/80 shadow-black/40"
              : "bg-white border-gray-200 shadow-gray-200/80",
            isRTL ? "left-0" : "right-0",
          )}
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div
            className={clsx(
              "flex items-center justify-between px-5 py-4 border-b",
              isDark
                ? "border-gray-700/80 bg-gray-900"
                : "border-gray-100 bg-gray-50/80",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className={clsx("text-sm font-semibold", textPrimary)}>
                {t("notifications")}
              </span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {unreadCount} {t("new")}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className={clsx(
                  "flex items-center gap-1 text-xs font-medium transition-colors",
                  "text-blue-500 hover:text-blue-600 dark:hover:text-blue-400",
                )}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("mark_all_read")}
              </button>
            )}
          </div>

          {/* Notification List */}
          {notifications?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <span
                className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isDark ? "bg-gray-800" : "bg-gray-100",
                )}
              >
                <Bell
                  className={clsx(
                    "w-5 h-5",
                    isDark ? "text-gray-600" : "text-gray-400",
                  )}
                />
              </span>
              <p className="text-sm text-gray-400 font-medium">
                {t("no_new_notifications")}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {notifications?.map((notification) => {
                const isUnread = !notification.isRead;
                const itemType = notification?.itemType;

                const queryParam = `${itemType.toLowerCase()}Id`;

                const handleNavigate = async () => {
                  dispatch(toggleNotification());
                  await markNotificationsAsRead(notification._id);
                  navigate(
                    `${itemEndpoint[itemType]}?${queryParam}=${notification.itemId}`,
                  );
                };

                return (
                  <div
                    key={notification?._id}
                    onClick={handleNavigate}
                    className={clsx(
                      "flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors duration-150 group",
                      isRTL ? "border-r-[3px]" : "border-l-[3px]",
                      getBorderColor(notification?.notifType, isRTL),
                      isUnread
                        ? isDark
                          ? "bg-blue-500/5 hover:bg-blue-500/10"
                          : "bg-blue-50/60 hover:bg-blue-50"
                        : isDark
                          ? "hover:bg-gray-800/60"
                          : "hover:bg-gray-50",
                    )}
                  >
                    {/* Icon */}
                    {getNotificationIcon(notification?.notifType)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={clsx(
                            "text-sm leading-snug",
                            isUnread
                              ? `font-semibold ${textPrimary}`
                              : `font-medium ${textSecondary}`,
                          )}
                        >
                          {notification?.content?.[language]?.title}
                        </h4>
                        {/* Unread dot */}
                        {isUnread && (
                          <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p
                        className={clsx(
                          "text-xs mt-0.5 leading-relaxed line-clamp-2",
                          textSecondary,
                        )}
                      >
                        {notification?.content?.[language]?.message}
                      </p>
                      <p
                        className={clsx(
                          "text-[11px] mt-1.5 font-medium",
                          textTertiary,
                        )}
                      >
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {notifications?.length > 0 && (
            <div
              className={clsx(
                "px-5 py-3 border-t",
                isDark
                  ? "border-gray-700/80 bg-gray-900"
                  : "border-gray-100 bg-gray-50/80",
              )}
            >
              <button
                onClick={handleViewAllNotification}
                className={clsx(
                  "w-full flex items-center justify-center gap-2",
                  "text-sm font-semibold text-blue-600 dark:text-blue-400",
                  "hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                )}
              >
                {t("view_all_notifications")}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
