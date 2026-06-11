import clsx from "clsx";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Info,
  XCircle,
  CheckCheck,
  ArrowRight,
  User,
  Tag,
  ExternalLink,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getBorderColor, timeAgo } from "@/helpers";
import { toggleNotification } from "@/features/uiSlice";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { itemEndpoint } from "@/lib/utils";
import { routes } from "@/lib/routes";
import {
  useMarkNotificationsAsReadMutation,
  useUpdateNotificationMutation,
} from "@/store/api/notificationApi";
import {
  markNotificationAsRead,
  setNotificationStatus,
} from "@/features/notificationSlice";
import {
  useApproveCategorySuggestionMutation,
  useUpdateBusinessMutation,
} from "@/store/api/businessMutationApi";
import { useUpdateProductMutation } from "@/store/api/productMutationApi";

const NotificationsBell = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("notifications");
  const popupRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const { isNotificationOpen } = useAppSelector((state) => state.ui);
  const { notifications } = useAppSelector((state) => state.notification);

  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const [updateNotification] = useUpdateNotificationMutation();
  const [approveCategorySuggestion] = useApproveCategorySuggestionMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

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
      case "UNREAD":
        return (
          <span className={`${base} bg-purple-100 dark:bg-purple-900/40`}>
            <Info className="w-4 h-4 text-purple-500" />
          </span>
        );
      case "ACTION":
        return (
          <span className={`${base} bg-yellow-50 dark:bg-amber-900/40`}>
            <AlertCircle className="w-4 h-4 text-amber-500" />
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
        !popupRef.current.contains(event.target as Node) &&
        !backdropRef.current?.contains(event.target as Node)
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

      {/* Notification Panel */}
      {isNotificationOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={() => dispatch(toggleNotification())}
          />

          <div
            ref={popupRef}
            className={clsx(
              "flex flex-col overflow-hidden shadow-2xl border z-50 animate-fade-in",
              "fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[85dvh]",
              "md:absolute md:bottom-auto md:rounded-2xl md:mt-2.5 md:w-105 md:max-h-150",
              isRTL ? "md:left-0 md:right-auto" : "md:right-0 md:left-auto",
              isDark
                ? "bg-gray-900 border-gray-700/80 shadow-black/40"
                : "bg-white border-gray-200 shadow-gray-200/80",
            )}
          >
            {/* Mobile drag handle */}
            <button
              onClick={() => dispatch(toggleNotification())}
              className="flex justify-center pt-2.5 pb-1 md:hidden shrink-0 w-full"
              aria-label="Close notifications"
            >
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </button>

            {/* Header */}
            <div
              className={clsx(
                "flex items-center justify-between px-5 py-4 border-b shrink-0",
                isDark ? "border-gray-700/80" : "border-gray-100",
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
                  const queryParam = `${itemType?.toLowerCase()}Id`;
                  const isApproving = approvingIds.has(notification._id);
                  const isApproved = notification.status === "APPROVED";

                  const isCategorySuggestion =
                    notification.notifType === "ACTION" &&
                    !!notification.actionData?.suggestedCategory;

                  const canApprove =
                    notification.notifType === "ACTION" &&
                    notification.status !== "CLOSED" &&
                    (itemType === "BUSINESS" || itemType === "PRODUCT");

                  const handleViewDetails = async (e: React.MouseEvent) => {
                    e.stopPropagation();
                    dispatch(toggleNotification());
                    await markNotificationsAsRead(notification._id);
                    dispatch(markNotificationAsRead(notification._id));
                    if (itemEndpoint[itemType]) {
                      navigate(
                        `${itemEndpoint[itemType]}?${queryParam}=${notification.itemId}`,
                      );
                    }
                  };

                  const handleApprove = async (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setApprovingIds((prev) =>
                      new Set(prev).add(notification._id),
                    );
                    try {
                      if (isCategorySuggestion) {
                        await approveCategorySuggestion({
                          itemId: notification.itemId,
                          itemType: notification.itemType,
                          categoryTitle:
                            notification.actionData?.suggestedCategory || "",
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
                        body: { status: "APPROVED", isRead: true },
                      }).unwrap();
                      dispatch(
                        setNotificationStatus({
                          notificationId: notification._id,
                          status: "APPROVED",
                        }),
                      );
                      toast.success("Approved successfully!");
                    } catch {
                      toast.error("Failed to approve. Please try again.");
                    } finally {
                      setApprovingIds((prev) => {
                        const next = new Set(prev);
                        next.delete(notification._id);
                        return next;
                      });
                    }
                  };

                  return (
                    <div
                      key={notification?._id}
                      className={clsx(
                        "flex items-start gap-3.5 px-5 py-4 transition-colors duration-150",
                        isRTL ? "border-r-[3px]" : "border-l-[3px]",
                        getBorderColor(notification?.notifType, isRTL),
                        !notification?.isRead
                          ? isDark
                            ? "bg-blue-500/5"
                            : "bg-blue-50/60"
                          : "",
                      )}
                    >
                      {/* Icon */}
                      <div className="shrink-0 mt-0.5">
                        {getNotificationIcon(notification?.notifType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title row */}
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
                          {isUnread && (
                            <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>

                        {/* Description */}
                        <p
                          className={clsx(
                            "text-xs mt-1 leading-relaxed line-clamp-2",
                            textSecondary,
                          )}
                        >
                          {notification?.content?.[language]?.message}
                        </p>

                        {/* Meta row: creator + category tag */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {notification?.creatorInfo?.name && (
                            <span
                              className={clsx(
                                "flex items-center gap-1 text-[11px]",
                                textTertiary,
                              )}
                            >
                              <User className="w-3 h-3" />
                              {notification.creatorInfo.name}
                            </span>
                          )}

                          {notification?.actionData?.suggestedCategory && (
                            <span
                              className={clsx(
                                "flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full",
                                isDark
                                  ? "bg-amber-900/30 text-amber-300"
                                  : "bg-amber-50 text-amber-700",
                              )}
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {notification.actionData.suggestedCategory}
                            </span>
                          )}

                          {itemType && (
                            <span
                              className={clsx(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                isDark
                                  ? "bg-gray-700 text-gray-400"
                                  : "bg-gray-100 text-gray-500",
                              )}
                            >
                              {itemType}
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p
                          className={clsx(
                            "text-[11px] mt-1.5 font-medium",
                            textTertiary,
                          )}
                        >
                          {timeAgo(notification.createdAt)}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-2.5">
                          {canApprove && (
                            <button
                              onClick={handleApprove}
                              disabled={isApproving || isApproved}
                              className={clsx(
                                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                                isApproved
                                  ? "bg-green-700 text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white",
                                "disabled:opacity-60 disabled:cursor-not-allowed",
                              )}
                            >
                              <Check className="w-3 h-3" />
                              {isApproved
                                ? "Approved"
                                : isApproving
                                  ? "Approving..."
                                  : "Approve"}
                            </button>
                          )}

                          {itemEndpoint[itemType] && (
                            <button
                              onClick={handleViewDetails}
                              className={clsx(
                                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                                isDark
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                              )}
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {notifications?.length > 0 && (
              <div
                className={clsx(
                  "px-5 py-3 border-t shrink-0",
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
        </>
      )}
    </div>
  );
};

export default NotificationsBell;
