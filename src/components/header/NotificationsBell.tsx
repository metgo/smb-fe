import clsx from "clsx";
import {
  AlertCircle,
  AlertTriangle,
  BellIcon,
  Info,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBorderColor, timeAgo } from "@/helpers";
import { toggleNotification } from "@/features/uiSlice";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import type { Notification } from "@/types/notifications";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { routes } from "@/lib/routes";

const NotificationsBell = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("notifications");
  const { notifications } = useAppSelector((state) => state.notification);

  const { isRTL, isDark, textPrimary, textSecondary, textTertiary, hoverBg } =
    useThemeClasses();
  const navigate = useNavigate();

  const { isNotificationOpen } = useAppSelector((state) => state.ui);

  const getNotificationIcon = (type: Notification["item"]["notifType"]) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "INFO":
        return <Info className={`${iconClass} text-blue-500`} />;
      case "ACTION":
        return <AlertCircle className={`${iconClass} text-purple-500`} />;
      case "WARNING":
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case "ERROR":
        return <XCircle className={`${iconClass} text-red-500`} />;
    }
  };
  const popupRef = useRef<HTMLDivElement>(null); // Ref for the popup

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen, dispatch]);

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
          ref={popupRef}
          className={clsx(
            "absolute  mt-2 w-96 max-h-100 overflow-y-auto rounded-xl shadow-xl border z-50 flex flex-col",
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
            isRTL ? "left-0" : "right-0 ",
          )}
        >
          {notifications?.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              {t("no_new_notifications")}
            </div>
          ) : (
            <>
              <div className="py-4 px-4 font-semibold bg-gray-50 border-b">
                {t("notifications")}
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 flex-1 overflow-y-auto">
                {notifications?.map((notification) => {
                  const itemType = notification?.item?.itemType; // BUSINESS, EVENT, PRODUCT, etc.
                  const detailsRouteKey =
                    `${itemType.toLowerCase()}-details` as keyof typeof routes;
                  const queryParam = `${itemType.toLowerCase()}Id`;

                  const handleNavigate = () => {
                    if (routes[detailsRouteKey]) {
                      navigate(
                        `${routes[detailsRouteKey]}?${queryParam}=${notification?.item?._id}`,
                      );
                    } else {
                      console.warn(
                        `No details route found for itemType: ${itemType}`,
                      );
                    }
                  };

                  return (
                    <div
                      key={notification?.item?._id}
                      onClick={handleNavigate}
                      className={`
                                         flex items-start gap-3 px-4 py-8 
                                         ${hoverBg} 
                                         transition-colors 
                                         ${isRTL ? "border-r-2" : "border-l-2"} 
                                         ${getBorderColor(notification?.item?.notifType, isRTL)} 
                                         ${notification.isRead ? (isDark ? "bg-gray-800/50" : "bg-blue-50/50") : ""}
                                       `}
                    >
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          {getNotificationIcon(notification?.item?.notifType)}
                        </div>
                        <div className="flex flex-col">
                          <h4 className={`text-sm font-medium ${textPrimary}`}>
                            {notification?.item?.title}
                          </h4>
                          <p className={`text-sm ${textSecondary} mb-1`}>
                            {notification?.item?.message}
                          </p>
                          <p className={`text-xs font-medium ${textTertiary}`}>
                            {timeAgo(notification.actionedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate("/notifications-management")}
                className="w-full p-3 text-sm font-semibold text-center text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-b-xl"
              >
                {t("view_all_notifications")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
