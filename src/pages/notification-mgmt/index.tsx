import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  Info,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCheck,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { itemEndpoint } from "@/lib/utils";
import { FilterButton } from "@/components/btns";
import { getBorderColor, timeAgo } from "@/helpers";
import { NotificationStatsCards } from "./components";
import SearchInput from "@/components/shared/SearchInput";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetAllNotificationsQuery,
  useGetNotificatonStatsQuery,
  useMarkNotificationsAsReadMutation,
} from "@/store/api/notificationApi";

const SEARCH_STORAGE_KEY = "notificationSearchTerm";

export default function NotificationsMgmtPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("notifications");
  const { t: tc } = useTranslation("common");

  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [allNotifications, setAllNotifications] = useState<INotification[]>([]);

  const [readFilter, setReadFilter] = useState<TNotifStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<TNotifType>("ALL");
  const [itemTypeFilter, setItemTypeFilter] = useState<TItemType>("ALL");

  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());

  const QueryParams = useMemo(() => {
    const params: any = {
      page,
      limit: 20,
      notifType: typeFilter,
      readType: readFilter,
      itemType: itemTypeFilter,
    };
    return params;
  }, [page, readFilter, typeFilter, itemTypeFilter]);

  const {
    data: notifications,
    refetch: refetchNotifList,
    isFetching,
  } = useGetAllNotificationsQuery(QueryParams);
  const { data: notifStats, refetch: refetchNotifStats } =
    useGetNotificatonStatsQuery();

  const hasMore = notifications?.meta?.hasNextPage || false;

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

  useEffect(() => {
    if (!notifications?.data) return;
    if (page === 1) {
      setAllNotifications(notifications.data);
    } else {
      setAllNotifications((prev) => {
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = notifications.data.filter(
          (b: any) => !existingIds.has(b._id),
        );
        return [...prev, ...newItems];
      });
    }
  }, [notifications?.data, page]);

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  };

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
            </div>
          </div>
        </div>

        {/* Stats & Toolbar */}
        <div className="shrink-0 p-6 pb-0">
          <div className="max-w-400 mx-auto">
            {/* Stats Cards */}
            {notifStats && <NotificationStatsCards stats={notifStats} />}

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
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                      <option value="ALL">{t("all")}</option>
                      <option value="UNREAD">{t("unread")}</option>
                      <option value="READ">{t("read")}</option>
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
                      <option value="ALL">{t("all_types")}</option>
                      <option value="INFO">{t("info")}</option>
                      <option value="ACTION">{t("action_required")}</option>
                      <option value="WARNING">{t("warning")}</option>
                      <option value="ERROR">{t("error")}</option>
                    </select>
                  </div>

                  {/*Item Type */}
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("item_type")}
                    </label>
                    <select
                      value={itemTypeFilter}
                      onChange={(e) => setItemTypeFilter(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary}`}
                    >
                      <option value="ALL">{t("all_types")}</option>
                      <option value="BUSINESS">{t("business")}</option>
                      <option value="PRODUCT">{t("product")}</option>
                      <option value="EVENT">{t("event")}</option>
                      <option value="TRIP">{t("trip")}</option>
                      <option value="FUNDAY">{t("funday")}</option>
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
            {allNotifications?.length === 0 ? (
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

                <InfiniteScroll
                  dataLength={allNotifications?.length}
                  next={fetchNextPage}
                  hasMore={hasMore}
                  scrollableTarget="scrollableDiv"
                  loader={
                    <p className={clsx("text-center mt-4", textTertiary)}>
                      {tc("loading_text")}
                    </p>
                  }
                  endMessage={
                    !hasMore && (
                      <p className={clsx("text-center mt-4", textTertiary)}>
                        {tc("loading_end_text")}
                      </p>
                    )
                  }
                >
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {allNotifications?.map((notification) => {
                      const itemType = notification?.itemType;
                      const queryParam = `${itemType.toLowerCase()}Id`;

                      const handleNavigate = async () => {
                        await markNotificationsAsRead(notification._id);
                        refetchNotifStats();
                        refetchNotifList();
                        navigate(
                          `${itemEndpoint[itemType]}?${queryParam}=${notification.itemId}`,
                        );
                      };

                      return (
                        <div
                          key={notification?._id}
                          onClick={handleNavigate}
                          className={`
    relative flex items-start gap-3 px-4 py-8 cursor-pointer
    ${hoverBg}
    transition-colors
    ${isRTL ? "border-r-2" : "border-l-2"}
    ${getBorderColor(notification?.notifType, isRTL)}
    
    ${!notification.isRead ? (isDark ? "bg-blue-900/20" : "bg-blue-50") : ""}
  `}
                        >
                          {/* Unread dot indicator */}
                          {!notification.isRead && (
                            <span className="absolute top-6 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                          )}

                          <div className="flex gap-3">
                            <div className="shrink-0 mt-0.5">
                              {getNotificationIcon(notification?.notifType)}
                            </div>

                            <div className="flex flex-col">
                              <h4
                                className={clsx(
                                  "text-sm",
                                  notification.isRead
                                    ? textPrimary
                                    : `font-semibold ${textPrimary}`,
                                )}
                              >
                                {notification?.content?.[language].title}
                              </h4>

                              <p
                                className={clsx(
                                  "text-sm mb-1",
                                  notification.isRead
                                    ? textSecondary
                                    : "text-gray-700 dark:text-gray-300",
                                )}
                              >
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
                </InfiniteScroll>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
