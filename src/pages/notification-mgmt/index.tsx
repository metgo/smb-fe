import { useState } from "react";
import {
  Bell,
  Info,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCheck,
  X,
} from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";
import { useTranslation } from "react-i18next";
import { FilterButton } from "@/components/btns";
import SearchInput from "@/components/shared/SearchInput";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getBorderColor, timeAgo } from "@/helpers";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";


export default function NotificationsMgmtPage() {
  const { t } = useTranslation("notifications");
  const SEARCH_STORAGE_KEY = "notificationSearchTerm";

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<
    "all" | "info" | "action" | "warning" | "error"
  >("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());

  const { notifications } = useAppSelector((state) => state.notification);

  const {
    isDark,
    isRTL,
    language,
    textTertiary,
    bgPrimary,
    bgSecondary,
    bgTertiary,
    textPrimary,
    textSecondary,
    borderColor,
    hoverBg,
  } = useThemeClasses();
  const navigate = useNavigate();

  const getNotificationIcon = (type: TNotifType) => {
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

  // const handleNotificationClick = (notification: Notification) => {
  //   // Mark as read
  //   if (!notification.read) {
  //     setNotifications((prev) =>
  //       prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
  //     );
  //   }

  //   // Navigate to related screen
  //   if (notification.relatedTo) {
  //     onNavigate?.(notification.relatedTo.module);
  //   }
  // };

  // const handleMarkAllAsRead = () => {
  //   setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  // };

  // const handleSelectAll = () => {
  //   if (selectedNotifications.size === filteredNotifications.length) {
  //     setSelectedNotifications(new Set());
  //   } else {
  //     setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
  //   }
  // };

  // const handleBulkMarkAsRead = () => {
  //   setNotifications((prev) =>
  //     prev.map((n) =>
  //       selectedNotifications.has(n.id) ? { ...n, read: true } : n,
  //     ),
  //   );
  //   setSelectedNotifications(new Set());
  // };

  // const handleBulkDelete = () => {
  //   setNotifications((prev) =>
  //     prev.filter((n) => !selectedNotifications.has(n.id)),
  //   );
  //   setSelectedNotifications(new Set());
  // };

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}  dark:bg-gray-950 transition-colors flex flex-col`}
    >
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Fixed Header */}
        <div className="shrink-0 p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-400 mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl mb-2 bg-linear-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t("notifications")}
                </h1>
                <p className={textSecondary}>{t("manage_notifications")}</p>
              </div>

              {/* {unreadNotifications > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-linear-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("mark_all_read")}</span>
                </button>
              )} */}
            </div>
          </div>
        </div>

        {/* Stats & Toolbar */}
        <div className="shrink-0 p-6 pb-0">
          <div className="max-w-400 mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Total */}
              <div
                className={`${bgSecondary} rounded-xl p-4 border ${borderColor} shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <span className={`text-sm ${textPrimary}`}>
                    {t("total_notifications")}
                  </span>
                </div>
                <p className={`text-2xl ${textPrimary} mb-1`}>{1}</p>
                <p className={`text-xs ${textTertiary}`}>{t("all_time")}</p>
              </div>

              {/* Unread */}
              <div
                className={`${bgSecondary} rounded-xl p-4 border ${borderColor} shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-teal-600" />
                  <span className={`text-sm ${textPrimary}`}>
                    {t("unread")}
                  </span>
                </div>
                <p className={`text-2xl ${textPrimary} mb-1`}>{2}</p>
                <p className={`text-xs ${textTertiary}`}>{t("new_messages")}</p>
              </div>

              {/* Action Required */}
              <div
                className={`${bgSecondary} rounded-xl p-4 border ${borderColor} shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  <span className={`text-sm ${textPrimary}`}>
                    {t("action_required")}
                  </span>
                </div>
                <p className={`text-2xl ${textPrimary} mb-1`}>{4}</p>
                <p className={`text-xs ${textTertiary}`}>
                  {t("needs_attention")}
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              {/* Search */}
              <div className="flex-1 relative">
                <SearchInput
                  placeholder={t("search_notifications")}
                  searchTerm={searchQuery}
                  setSearchTerm={setSearchQuery}
                  storageKey={SEARCH_STORAGE_KEY}
                />
              </div>

              {/* Filters Button */}
              <div className="flex items-center gap-2">
                <FilterButton value={showFilters} onChange={setShowFilters} />
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div
                className={`mb-6 p-4 rounded-xl border ${borderColor} ${bgSecondary}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Read Status */}
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("read_status")}
                    </label>
                    <select
                      value={readFilter}
                      onChange={(e) => setReadFilter(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary}`}
                    >
                      <option value="all">{t("all")}</option>
                      <option value="unread">{t("unread")}</option>
                      <option value="read">{t("read")}</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("notification_type")}
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary}`}
                    >
                      <option value="all">{t("all_types")}</option>
                      <option value="info">{t("info")}</option>
                      <option value="action">{t("action_required")}</option>
                      <option value="warning">{t("warning")}</option>
                      <option value="error">{t("error")}</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("date_range")}
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary}`}
                    >
                      <option value="all">{t("all_time")}</option>
                      <option value="today">{t("today")}</option>
                      <option value="week">{t("this_week")}</option>
                      <option value="month">{t("this_month")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="max-w-400 mx-auto">
            {notifications?.length === 0 ? (
              <div
                className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full ${bgTertiary} flex items-center justify-center`}
                >
                  <CheckCheck className={`w-8 h-8 ${textTertiary}`} />
                </div>

                <h3 className={`text-lg ${textPrimary} mb-2`}>
                  {searchQuery || showFilters
                    ? t("no_notifications_found")
                    : t("all_caught_up")}
                </h3>

                <p className={`${textTertiary}`}>
                  {searchQuery || showFilters
                    ? t("try_adjusting_filters")
                    : t("no_new_notifications")}
                </p>
              </div>
            ) : (
              <div
                className={`rounded-xl border ${borderColor} ${bgSecondary} overflow-hidden`}
              >
                {selectedNotifications.size > 0 && (
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-xl mb-3 
                  ${bgTertiary} border ${borderColor}`}
                  >
                    {/* Left Side */}
                    <div className="flex items-center gap-2">
                      {/* Double Check Icon */}
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 13l4 4L23 7"
                          />
                        </svg>
                      </div>

                      <span className={`text-sm font-medium ${textPrimary}`}>
                        {selectedNotifications.size} selected
                      </span>
                    </div>

                    {/* Right Side Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Mark as Read */}
                      <button
                        // onClick={handleBulkMarkAsRead}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                      >
                        Mark as read
                      </button>

                      {/* Delete */}
                      <button
                        // onClick={handleBulkDelete}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                      >
                        Delete
                      </button>

                      {/* Close / Clear Selection */}
                      <button
                        onClick={() => setSelectedNotifications(new Set())}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                )}
                <div
                  className={`${bgTertiary} border-b ${borderColor} px-4 py-3 flex items-center gap-3`}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedNotifications.size === notifications?.length
                    }
                    // onChange={handleSelectAll}
                    className="rounded"
                  />
                  <span className={`text-sm ${textSecondary}`}>
                    {t("select_all")}
                  </span>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications?.map((notification) => {
                    const itemType = notification?.itemType; // BUSINESS, EVENT, PRODUCT, etc.
                    const detailsRouteKey =
                      `${itemType.toLowerCase()}-details` as keyof typeof routes;
                    const queryParam = `${itemType.toLowerCase()}Id`;

                    const handleNavigate = () => {
                      if (routes[detailsRouteKey]) {
                        navigate(
                          `${routes[detailsRouteKey]}?${queryParam}=${notification?._id}`,
                        );
                      } else {
                        console.warn(
                          `No details route found for itemType: ${itemType}`,
                        );
                      }
                    };

                    return (
                      <div
                        key={notification?._id}
                        onClick={handleNavigate}
                        className={`
                          flex items-start gap-3 px-4 py-8 
                          ${hoverBg} 
                          transition-colors 
                          ${isRTL ? "border-r-2" : "border-l-2"} 
                          ${getBorderColor(notification?.notifType, isRTL)} 
                          ${notification.isRead ? (isDark ? "bg-gray-800/50" : "bg-blue-50/50") : ""}
                        `}
                      >
                        <div className="flex gap-3">
                          <div className="shrink-0 mt-0.5">
                            {getNotificationIcon(notification?.notifType)}
                          </div>
                          <div className="flex flex-col">
                            <h4
                              className={`text-sm font-medium ${textPrimary}`}
                            >
                              {notification?.content?.[language].title}
                            </h4>
                            <p className={`text-sm ${textSecondary} mb-1`}>
                              {notification?.content?.[language]?.message}
                            </p>
                            <p
                              className={`text-xs font-medium ${textTertiary}`}
                            >
                              {timeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
