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
  Eye,
  Siren,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { itemEndpoint } from "@/lib/utils";
import { FilterButton } from "@/components/btns";
import { getBorderColor, timeAgo } from "@/helpers";
import {
  NotificationStatsCards,
  NotificationsMgmtSkeleton,
} from "./components";
import SearchInput from "@/components/shared/SearchInput";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetAllNotificationsQuery,
  useGetNotificatonStatsQuery,
  useMarkNotificationsAsReadMutation,
  useUpdateNotificationMutation,
} from "@/store/api/notificationApi";
import {
  useApproveCategorySuggestionMutation,
  useUpdateBusinessMutation,
} from "@/store/api/businessMutationApi";
import { useGetChangesByEntityQuery } from "@/store/api/businessQueryApi";
import { useUpdateProductMutation } from "@/store/api/productMutationApi";
import { toast } from "sonner";
import { useSocket } from "@/providers/SocketProvider";
import { ViewChangesModal } from "@/components/change-tracking";
import { useAppSelector } from "@/hooks/hooks";

const SEARCH_STORAGE_KEY = "notificationSearchTerm";

export default function NotificationsMgmtPage() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { t } = useTranslation("notifications");
  const { t: tc } = useTranslation("common");
  const userRole = useAppSelector((state) => state.auth.userRole);

  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const [updateNotification] = useUpdateNotificationMutation();
  const [approveCategorySuggestion] = useApproveCategorySuggestionMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [allNotifications, setAllNotifications] = useState<INotification[]>([]);

  const [readFilter, setReadFilter] = useState<TNotifStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<TNotifType>("ALL");
  const [itemTypeFilter, setItemTypeFilter] = useState<TItemType>("ALL");

  const [selectedNotifications, setSelectedNotifications] = useState<    Set<string>  >(new Set());

  const [viewChangesState, setViewChangesState] = useState({
    isOpen: false,
    entityType: "business" as "business" | "product" | "event" | "poi",
    entityId: "",
    entityName: "",
  });

  const { data: changesData, isLoading: changesLoading } =
    useGetChangesByEntityQuery(
      {
        entityType: viewChangesState.entityType,
        entityId: viewChangesState.entityId,
      },
      {
        skip: !viewChangesState.isOpen || !viewChangesState.entityId,
      },
    );

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
    isError: isNotifError,
  } = useGetAllNotificationsQuery(QueryParams);
  const { data: notifStats, refetch: refetchNotifStats } =
    useGetNotificatonStatsQuery();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      console.log("New notification", data);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  const hasMore =
    !isNotifError &&
    notifications?.meta?.hasNextPage &&
    notifications?.data?.length > 0
      ? true
      : false;

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
    if (!notifications?.data || notifications.data.length === 0) return;
    if (page === 1) {
      setAllNotifications(notifications.data);
    } else {
      setAllNotifications((prev) => {
        if (!prev || prev.length === 0) return notifications.data;
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = notifications.data.filter(
          (b: any) => !existingIds.has(b._id),
        );
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }
  }, [notifications, page]);

  useEffect(() => {
    if (isNotifError) {
      setPage(1);
    }
  }, [isNotifError]);

  useEffect(() => {
    setPage(1);
  }, [readFilter, typeFilter, itemTypeFilter]);

  // ─── Close the drawer on scroll, same as the businesses page ──────────
  useEffect(() => {
    const scrollEl = document.getElementById("scrollableDiv");
    if (!scrollEl) return;
    const handleScroll = () => {
      if (scrollEl.scrollTop > 20) {
        setShowControlsDrawer(false);
      }
    };
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNextPage = () => {
    if (!hasMore || isFetching || isNotifError) return;
    setPage((prev) => prev + 1);
  };

  const getNotificationIcon = (type: TNotifType) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "INFO":
        return <Info className={`${iconClass} text-blue-500`} />;
      case "ACTION":
        return <AlertCircle className={`${iconClass} text-amber-500`} />;
      case "WARNING":
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case "ERROR":
        return <XCircle className={`${iconClass} text-red-500`} />;
      case "DISPUTE":
        return <Siren className={`${iconClass} text-red-500`} />;
    }
  };

  // ─── Active filter count for the toggle badge ──────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery?.trim()) count += 1;
    if (readFilter !== "ALL") count += 1;
    if (typeFilter !== "ALL") count += 1;
    if (itemTypeFilter !== "ALL") count += 1;
    return count;
  }, [searchQuery, readFilter, typeFilter, itemTypeFilter]);

  // ─── Reusable icon-only filter toggle button (mirrors businesses page) ─
  const filterToggleButton = (
    <button
      onClick={() => setShowControlsDrawer((prev) => !prev)}
      className={clsx(
        "relative p-2 rounded-xl border transition-all cursor-pointer shrink-0",
        showControlsDrawer
          ? "bg-teal-600 text-white border-teal-500 shadow-teal-500/20"
          : isDark
            ? "bg-gray-900 border-gray-800 text-teal-400 hover:bg-gray-800 hover:border-teal-500/40"
            : "bg-gray-100 border-gray-200 text-teal-700 hover:bg-gray-200 hover:border-teal-400"
      )}
      title={
        showControlsDrawer
          ? t("close_options") ?? "Close Options"
          : t("search_and_filters") ?? "Search & Filters"
      }
    >
      <SlidersHorizontal className="w-4 h-4" />
      {activeFilterCount > 0 && (
        <span
          className={clsx(
            "absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none",
            showControlsDrawer
              ? "bg-white text-teal-600"
              : "bg-teal-500 text-white"
          )}
        >
          {activeFilterCount > 9 ? "9+" : activeFilterCount}
        </span>
      )}
    </button>
  );

  if (isFetching && page === 1 && allNotifications.length === 0) {
    return (
      <div
        className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"} transition-colors flex flex-col`}
      >
        <NotificationsMgmtSkeleton />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"} transition-colors flex flex-col`}
    >
      <div className="h-[calc(100vh-64px)] flex flex-col px-4 sm:px-6 pt-4 gap-3">
        {/* Sticky Top Header Bar (Title + Count + Stats) */}
        <div
          className={clsx(
            "sticky top-0 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
            isDark
              ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900"
          )}
        >
          {/* Left: Title + Count */}
          <div className="flex flex-col items-start gap-1 shrink-0">
            <div className="flex items-center w-full justify-between gap-2">
              <div className="flex items-center gap-1">
                <h1 className="text-base md:text-lg font-bold bg-clip-text bg-gradient-to-r text-transparent from-blue-500 via-purple-600 to-pink-600 whitespace-nowrap">
                  {t("notifications")}
                </h1>
                {notifications?.meta?.total !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                    {notifications.meta.total}
                  </span>
                )}
              </div>

              <div className="block xl:hidden items-center gap-2 shrink-0">
                {filterToggleButton}
              </div>
            </div>
            <p className={clsx("text-xs", textSecondary)}>
              {t("manage_notifications")}
            </p>
          </div>

          {/* Right: Stats row (horizontal, same treatment as StatsMarquee) */}
          <div
            dir="ltr"
            className="flex-1 min-w-0 flex flex-row items-center gap-2 overflow-x-auto flex-nowrap py-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {notifStats && <NotificationStatsCards stats={notifStats} />}
          </div>

          {/* Search & Filters Toggle Button next to stats (desktop) */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            {filterToggleButton}
          </div>
        </div>

        {/* Expandable Search, Filters & Toolbar Panel */}
        {showControlsDrawer && (
          <div
            className={clsx(
              "transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2",
              isDark
                ? "bg-gray-900/90 border-gray-800/90"
                : "bg-white border-gray-200"
            )}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex-1 min-w-0 relative">
                <SearchInput
                  placeholder={t("search_notifications")}
                  searchTerm={searchQuery}
                  setSearchTerm={setSearchQuery}
                  storageKey={SEARCH_STORAGE_KEY}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton value={showFilters} onChange={setShowFilters} />
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className={`p-4 rounded-xl border ${borderColor} ${bgTertiary}`}>
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
                      {t("action_type")}
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary}`}
                    >
                      <option value="ALL">{t("all")}</option>
                      <option value="INFO">{t("info")}</option>
                      <option value="ACTION">{t("action_required")}</option>
                      <option value="WARNING">{t("warning")}</option>
                      <option value="ERROR">{t("error")}</option>
                      <option value="URGENT">{t("urgent")}</option>
                    </select>
                  </div>

                  {/* Item Type */}
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("item_type")}
                    </label>
                    <select
                      value={itemTypeFilter}
                      onChange={(e) => setItemTypeFilter(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary}`}
                    >
                      <option value="ALL">{t("all")}</option>
                      <option value="BUSINESS">{t("business")}</option>
                      <option value="PRODUCT">{t("product")}</option>
                      <option value="EVENT">{t("event")}</option>
                      <option value="TRIP">{t("trip")}</option>
                      <option value="FUNDAY">{t("funday")}</option>
                      <option value="USER">{t("user")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected-items bulk bar (kept inline above the list, same spot as before) */}
        {selectedNotifications.size > 0 && (
          <div
            className={`flex items-center justify-between px-4 py-3 rounded-xl
            ${bgTertiary} border ${borderColor}`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                <CheckCheck className="w-4 h-4 text-green-600" />
              </div>
              <span className={`text-sm font-medium ${textPrimary}`}>
                {selectedNotifications.size} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                Mark as read
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition">
                Delete
              </button>
              <button
                onClick={() => setSelectedNotifications(new Set())}
                className={`p-1.5 rounded-lg transition ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Notifications List */}
        <div id="scrollableDiv" className="flex-1 overflow-y-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6">
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
                  <div
                    className={`divide-y ${
                      isDark ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {allNotifications?.map((notification) => {
                      const itemType = notification?.itemType;
                      if (!itemType) return null;
                      const queryParam = `${itemType.toLowerCase()}Id`;
                      const isApproved = notification.status === "APPROVED";
                      const canApprove =
                        notification.notifType === "ACTION" &&
                        notification.status !== "CLOSED" &&
                        (itemType === "BUSINESS" || itemType === "PRODUCT");

                      const markApprovedLocally = () => {
                        setAllNotifications((prev) =>
                          prev.map((item) =>
                            item._id === notification._id
                              ? {
                                  ...item,
                                  status: "APPROVED",
                                  isRead: true,
                                }
                              : item,
                          ),
                        );
                      };

                      const handleViewChanges = async (e: React.MouseEvent) => {
                        e.stopPropagation();
                        await markNotificationsAsRead(notification._id);

                        const typeMap: Record<
                          string,
                          "business" | "product" | "event" | "poi"
                        > = {
                          BUSINESS: "business",
                          PRODUCT: "product",
                          EVENT: "event",
                          POI: "poi",
                        };

                        setViewChangesState({
                          isOpen: true,
                          entityType: typeMap[itemType] || "business",
                          entityId: notification.itemId,
                          entityName:
                            notification?.content?.[language]?.title ||
                            itemType,
                        });
                      };

                      const handleNavigate = async () => {
                        await markNotificationsAsRead(notification._id);
                        refetchNotifStats();
                        refetchNotifList();
                        const paramName =
                          itemType === "DISPUTE"
                            ? "orderProductId"
                            : queryParam;

                        const idValue =
                          itemType === "DISPUTE"
                            ? notification.orderProductId
                            : notification.itemId;
                        const disputeParam =
                          itemType === "DISPUTE"
                            ? `&disputeId=${notification.itemId}`
                            : "";

                        navigate(
                          `${itemEndpoint[itemType]}?${paramName}=${idValue}${disputeParam}`,
                        );
                      };

                      return (
                        <div
                          key={notification?._id}
                          onClick={handleNavigate}
                          className={`
                          relative flex items-start gap-3 px-4 py-4 cursor-pointer
                          ${hoverBg}
                          transition-colors
                          ${isRTL ? "border-r-2" : "border-l-2"}
                        ${getBorderColor(notification?.notifType, isRTL)}
                          ${!notification.isRead ? (isDark ? "bg-blue-900/20" : "bg-blue-50") : ""}
                        `}
                        >
                          {!notification.isRead && (
                            <span
                              className={`absolute top-6 ${
                                isRTL ? "left-4" : "right-4"
                              } w-2.5 h-2.5 bg-blue-500 rounded-full`}
                            ></span>
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
                                {notification?.content?.[language]?.title}
                              </h4>

                              <p
                                className={clsx(
                                  "text-sm mb-1",
                                  notification.isRead
                                    ? textSecondary
                                    : "text-gray-400",
                                )}
                              >
                                {notification?.content?.[language]?.message}
                              </p>

                              <p
                                className={`text-xs font-medium ${textTertiary}`}
                              >
                                {timeAgo(notification.createdAt)}
                              </p>

                              {canApprove && (
                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (isApproved) return;
                                      try {
                                        if (
                                          notification.actionData
                                            ?.suggestedCategory
                                        ) {
                                          await approveCategorySuggestion({
                                            itemId: notification.itemId,
                                            itemType: notification.itemType,
                                            categoryTitle:
                                              notification.actionData
                                                ?.suggestedCategory || "",
                                            notificationId: notification._id,
                                          }).unwrap();
                                        } else if (itemType === "BUSINESS") {
                                          await updateBusiness({
                                            businessId: notification.itemId,
                                            body: { status: "APPROVED" },
                                          }).unwrap();
                                        } else if (itemType === "PRODUCT") {
                                          await updateProduct({
                                            productId: notification.itemId,
                                            body: { status: "APPROVED" },
                                          }).unwrap();
                                        }
                                        await updateNotification({
                                          notificationId: notification._id,
                                          body: {
                                            status: "APPROVED",
                                            isRead: true,
                                          },
                                        }).unwrap();
                                        markApprovedLocally();
                                        toast.success("Approved successfully!");
                                        refetchNotifList();
                                      } catch (err) {
                                        toast.error(
                                          "Failed to approve. Please try again.",
                                        );
                                      }
                                    }}
                                    disabled={isApproved}
                                    className={clsx(
                                      "px-3 py-1.5 text-xs font-medium text-white rounded-lg transition",
                                      isApproved
                                        ? "bg-green-700 opacity-60 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700",
                                    )}
                                  >
                                    {isApproved ? t("approved") : t("approve")}
                                  </button>

                                  {(notification.status === "PENDING" ||
                                    notification.status === "DRAFT") &&
                                    (notification.changesCount as number) >
                                      0 && (
                                      <button
                                        onClick={handleViewChanges}
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-1"
                                      >
                                        <Eye size={14} />
                                        {t("view_changes")}
                                      </button>
                                    )}
                                </div>
                              )}
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

      <ViewChangesModal
        isOpen={viewChangesState.isOpen}
        onClose={() =>
          setViewChangesState({ ...viewChangesState, isOpen: false })
        }
        entityType={viewChangesState.entityType}
        entityId={viewChangesState.entityId}
        entityName={viewChangesState.entityName}
        changeData={
          changesData &&
          Array.isArray(changesData.changes) &&
          changesData.changes.length > 0
            ? {
                changeId: changesData._id || undefined,
                changes: changesData.changes || [],
                summary: changesData.summary || "",
                changesCount: changesData.changesCount || 0,
                changedBy: changesData.changedBy || {
                  firstName: "",
                  email: "",
                },
                changedAt: changesData.changedAt || new Date(),
                status: changesData.status || "PENDING",
              }
            : undefined
        }
        isLoading={changesLoading}
        userRole={userRole as any}
        onApprove={() => {
          setViewChangesState({ ...viewChangesState, isOpen: false });
          refetchNotifList();
        }}
      />
    </div>
  );
}