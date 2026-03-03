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

interface NotificationsMgmtPageProps {
  onNavigate?: (item: string) => void;
}

export default function NotificationsMgmtPage({
  onNavigate,
}: NotificationsMgmtPageProps) {
  const { t } = useTranslation("notifications");
  const SEARCH_STORAGE_KEY = "notificationSearchTerm";
  const { isDark } = useThemeClasses();
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  // const language = i18n.language;
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

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>(
    generateMockNotifications(),
  );

  // Theme-aware classes
  const bgPrimary = theme === "dark" ? "bg-gray-950" : "bg-gray-50";
  const bgSecondary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgTertiary = theme === "dark" ? "bg-gray-800" : "bg-gray-100";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const borderColor = theme === "dark" ? "border-gray-800" : "border-gray-200";
  const hoverBg = theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Search
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = notification.title.toLowerCase().includes(searchLower);
    const descMatch = notification.description
      .toLowerCase()
      .includes(searchLower);
    if (searchQuery && !titleMatch && !descMatch) return false;

    // Read filter
    if (readFilter === "read" && !notification.read) return false;
    if (readFilter === "unread" && notification.read) return false;

    // Type filter
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const notifDate = new Date(notification.timestamp);
      const diffInDays = Math.floor(
        (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dateFilter === "today" && diffInDays > 0) return false;
      if (dateFilter === "week" && diffInDays > 7) return false;
      if (dateFilter === "month" && diffInDays > 30) return false;
    }

    return true;
  });

  // Calculate stats
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const actionRequiredNotifications = notifications.filter(
    (n) => n.type === "action" && !n.read,
  ).length;

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

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
    }

    // Navigate to related screen
    if (notification.relatedTo) {
      onNavigate?.(notification.relatedTo.module);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const handleBulkMarkAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        selectedNotifications.has(n.id) ? { ...n, read: true } : n,
      ),
    );
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = () => {
    setNotifications((prev) =>
      prev.filter((n) => !selectedNotifications.has(n.id)),
    );
    setSelectedNotifications(new Set());
  };

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}  dark:bg-gray-950 transition-colors flex flex-col`}
    >
      <main className="h-[calc(100vh-64px)] flex flex-col">
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

              {unreadNotifications > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-linear-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("mark_all_read")}</span>
                </button>
              )}
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
                <p className={`text-2xl ${textPrimary} mb-1`}>
                  {totalNotifications}
                </p>
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
                <p className={`text-2xl ${textPrimary} mb-1`}>
                  {unreadNotifications}
                </p>
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
                <p className={`text-2xl ${textPrimary} mb-1`}>
                  {actionRequiredNotifications}
                </p>
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
            {filteredNotifications.length === 0 ? (
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
                        onClick={handleBulkMarkAsRead}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                      >
                        Mark as read
                      </button>

                      {/* Delete */}
                      <button
                        onClick={handleBulkDelete}
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
                      selectedNotifications.size ===
                      filteredNotifications.length
                    }
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  <span className={`text-sm ${textSecondary}`}>
                    {t("select_all")}
                  </span>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-4 py-4 ${hoverBg} transition-colors border-${isRTL ? "r" : "l"}-2 ${getBorderColor(notification.type)} ${!notification.read ? (theme === "dark" ? "bg-gray-800/50" : "bg-blue-50/50") : ""}`}
                    >
                      {" "}
                      {/* Checkbox */}{" "}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedNotifications);
                          if (e.target.checked) {
                            newSet.add(notification.id);
                          } else {
                            newSet.delete(notification.id);
                          }
                          setSelectedNotifications(newSet);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded mt-1"
                      />{" "}
                      {/* Icon */}{" "}
                      <div className="shrink-0 mt-0.5">
                        {" "}
                        {getNotificationIcon(notification.type)}{" "}
                      </div>{" "}
                      {/* Content */}{" "}
                      <button
                        onClick={() => handleNotificationClick(notification)}
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Mock data generator
function generateMockNotifications(): Notification[] {
  const types: Notification["type"][] = ["info", "action", "warning", "error"];
  const notifications: Notification[] = [];

  const templates = [
    {
      type: "action" as const,
      title: "New business awaiting approval",
      description:
        "Desert Lodge Hotel has submitted their business profile for review",
      relatedTo: { module: "businesses", id: "biz-1" },
    },
    {
      type: "info" as const,
      title: "Order completed",
      description: "Order #12345 has been completed and paid",
      relatedTo: { module: "orders", id: "order-1" },
    },
    {
      type: "warning" as const,
      title: "Product stock running low",
      description: "Camel Desert Tour - only 3 spots remaining",
      relatedTo: { module: "products", id: "product-1" },
    },
    {
      type: "error" as const,
      title: "Payment failed",
      description: "Payment processing error for order #12346",
      relatedTo: { module: "orders", id: "order-2" },
    },
    {
      type: "action" as const,
      title: "Event needs approval",
      description: "Negev Music Festival 2025 is pending your review",
      relatedTo: { module: "events", id: "event-1" },
    },
    {
      type: "info" as const,
      title: "New voucher issued",
      description: "10% discount voucher created for Summer Campaign",
      relatedTo: { module: "vouchers", id: "voucher-1" },
    },
    {
      type: "warning" as const,
      title: "Trip capacity reached",
      description: "Ramon Crater Hiking Trip is now fully booked",
      relatedTo: { module: "trips", id: "trip-1" },
    },
    {
      type: "info" as const,
      title: "New review posted",
      description:
        "A new 5-star review was posted for Be'er Sheva Wellness Spa",
      relatedTo: { module: "businesses", id: "biz-2" },
    },
  ];

  for (let i = 0; i < 25; i++) {
    const template = templates[i % templates.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    notifications.push({
      id: `notification-${i + 1}`,
      ...template,
      timestamp: new Date(
        Date.now() -
          daysAgo * 24 * 60 * 60 * 1000 -
          hoursAgo * 60 * 60 * 1000 -
          minutesAgo * 60 * 1000,
      ),
      read: Math.random() > 0.4, // 60% read, 40% unread
    });
  }

  return notifications.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}
