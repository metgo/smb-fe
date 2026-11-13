import clsx from "clsx";
import { useState, useMemo, useEffect } from "react";
import {
  Package,
  Store,
  Calendar,
  MapPin,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import {
  useGetPendingApprovalsQuery,
  useGetChangesByEntityQuery,
} from "@/store/api/businessQueryApi";
import { StatusPill } from "@/components/pills";
import { routes } from "@/lib/routes";
import TabsSection from "@/components/shared/TabsSection";
import StatsMarquee from "@/components/shared/StatsMarquee";
import { ReordableDataTable } from "@/components/shared";
import { ViewChangesModal } from "@/components/change-tracking";
import { formatDateTime } from "@/helpers/formatter";

const LIMIT = 20;

const getItemTypeIcon = (type: string) => {
  switch (type) {
    case "business":
      return <Store size={16} className="text-blue-500" />;
    case "product":
      return <Package size={16} className="text-green-500" />;
    case "event":
      return <Calendar size={16} className="text-purple-500" />;
    case "poi":
      return <MapPin size={16} className="text-orange-500" />;
    default:
      return <Package size={16} className="text-gray-500" />;
  }
};

const getItemTypeLabel = (type: string, t: any) => {
  switch (type) {
    case "business":
      return t("business");
    case "product":
      return t("product");
    case "event":
      return t("event");
    case "poi":
      return t("poi");
    default:
      return "Item";
  }
};

const stripHtmlTags = (html: string | undefined) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

const getLocalizedField = (item: any, baseField: string, language: string) => {
  if (language === "en") {
    return item[baseField];
  }
  const localizedField = `${baseField}${language.charAt(0).toUpperCase()}${language.slice(1)}`;
  return item[localizedField] || item[baseField];
};

export default function PendingApprovalsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("pending_approvals");
  const { isDark, language } = useThemeClasses();
  const { userRole, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
  );
  const [page, setPage] = useState(1);
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const [viewChangesState, setViewChangesState] = useState({
    isOpen: false,
    entityType: "business" as "business" | "product" | "event" | "poi",
    entityId: "",
    entityName: "",
    changeId: "",
  });

  const tabs = useMemo(
    () => [
      { id: "all", label: t("all"), icon: Package },
      { id: "business", label: t("businesses"), icon: Store },
      { id: "product", label: t("products"), icon: Package },
      { id: "event", label: t("events"), icon: Calendar },
      { id: "poi", label: t("pois"), icon: MapPin },
    ],
    [t],
  );

  const handleViewDetails = (item: any) => {
    switch (item.type) {
      case "business":
        navigate(`${routes.businessDetails}?businessId=${item._id}`);
        break;
      case "product":
        navigate(`${routes.productDetails}?productId=${item._id}`);
        break;
      case "event":
        navigate(`${routes.eventDetails}?eventId=${item._id}`);
        break;
      case "poi":
        navigate(`${routes.poiDetails}?poiId=${item._id}`);
        break;
      default:
        break;
    }
  };

  const handleViewDetailsButton = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    handleViewDetails(item);
  };

  const handleViewChanges = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setViewChangesState({
      isOpen: true,
      entityType: item.type,
      entityId: item._id,
      entityName: getLocalizedField(item, "name", language),
      changeId: item._id,
    });
  };

  const {
    data: approvalsData,
    isLoading,
    isFetching,
    isError,
    refetch: refetchApprovals,
  } = useGetPendingApprovalsQuery(
    {
      page,
      limit: LIMIT,
      ...(dmoId && { dmoId }),
      ...(authorityId && { authorityId }),
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const { data: changesData, isLoading: changesLoading } =
    useGetChangesByEntityQuery(
      {
        entityType: viewChangesState.entityType,
        entityId: viewChangesState.entityId,
      },
      {
        skip: !viewChangesState.isOpen || !viewChangesState.entityId,
        refetchOnMountOrArgChange: true,
      },
    );

  const hasMore = approvalsData?.meta?.hasNextPage;
  const total = approvalsData?.meta?.total || 0;
  const apiCounts = approvalsData?.meta?.counts || {
    business: 0,
    product: 0,
    event: 0,
    poi: 0,
  };

  // Accumulate items across pages
  useEffect(() => {
    if (!approvalsData?.data?.length) {
      setCombinedItems([]);
      return;
    }

    setCombinedItems((prev) => {
      if (page === 1) return approvalsData.data;
      const existingIds = new Set(prev.map((item) => item._id));
      const newItems = approvalsData.data.filter(
        (item: any) => !existingIds.has(item._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [approvalsData, page]);

  // Filter items based on active tab
  const filteredItems =
    activeTab === "all"
      ? combinedItems
      : combinedItems.filter((item) => item.type === activeTab);

  const pendingItems = filteredItems;

  // Auto-load more pages if current tab has fewer items than API count
  useEffect(() => {
    const currentTabCount = apiCounts[activeTab as keyof typeof apiCounts] || 0;
    const isTabSpecific = activeTab !== "all";
    const itemsLoadedForTab = filteredItems.length;

    if (
      isTabSpecific &&
      itemsLoadedForTab < currentTabCount &&
      hasMore &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  }, [activeTab, filteredItems.length, hasMore, isFetching, apiCounts]);

  const pendingStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total"),
        value: total,
        icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      },
      {
        id: 2,
        title: t("total_businesses"),
        value: apiCounts.business,
        label: t("pending"),
        icon: <Store className="w-5 h-5 text-blue-500" />,
      },
      {
        id: 3,
        title: t("total_products"),
        value: apiCounts.product,
        label: t("pending"),
        icon: <Package className="w-5 h-5 text-green-500" />,
      },
      {
        id: 4,
        title: t("total_events"),
        value: apiCounts.event,
        label: t("pending"),
        icon: <Calendar className="w-5 h-5 text-purple-500" />,
      },
      {
        id: 5,
        title: t("total_pois"),
        value: apiCounts.poi,
        label: t("pending"),
        icon: <MapPin className="w-5 h-5 text-orange-500" />,
      },
    ],
    [total, apiCounts, t],
  );

  const columns = useMemo(
    () => [
      {
        key: "type",
        label: t("type"),
        render: (item: any) => (
          <div className="flex items-center gap-2">
            {getItemTypeIcon(item.type)}
            <span
              className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}
            >
              {getItemTypeLabel(item.type, t)}
            </span>
          </div>
        ),
      },
      {
        key: "name",
        label: t("name"),
        sortable: true,
        render: (item: any) => (
          <div
            className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
          >
            {getLocalizedField(item, "name", language) ?? "-"}
          </div>
        ),
      },
      {
        key: "shortDescription",
        label: t("description"),
        render: (item: any) => (
          <div
            className={`text-sm truncate max-w-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            {stripHtmlTags(
              getLocalizedField(item, "shortDescription", language) ||
                getLocalizedField(item, "description", language),
            ) || "-"}
          </div>
        ),
      },
      {
        key: "status",
        label: t("status"),
        render: (item: any) => <StatusPill status={item.status} />,
      },
      {
        key: "createdAt",
        label: t("created"),
        sortable: true,
        render: (item: any) => (
          <div
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {formatDateTime(item.createdAt, language)}
          </div>
        ),
      },
      {
        key: "actions",
        label: t("action"),
        render: (item: any) => (
          <div className="flex items-center gap-3 justify-start">
            <button
              onClick={(e) => handleViewChanges(e, item)}
              className={`p-2 rounded-lg transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-700 text-purple-400" : "bg-gray-100 hover:bg-gray-200 text-purple-600"}`}
              title={t("view_changes")}
            >
              <FileText size={18} />
            </button>
            <button
              onClick={(e) => handleViewDetailsButton(e, item)}
              className={`p-2 rounded-lg transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-700 text-blue-400" : "bg-gray-100 hover:bg-gray-200 text-blue-600"}`}
              title={t("view")}
            >
              <Eye size={18} />
            </button>
          </div>
        ),
      },
    ],
    [isDark, language, t],
  );

  return (
    <>
      <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        {/* Sticky Top Header Bar (Title + Count + Stats) — same as Events */}
        <div
          className={clsx(
            "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
            isDark
              ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          )}
        >
          {/* Left: Title + Count */}
          <div className="flex flex-col items-start gap-1 shrink-0">
            <div className="flex items-center gap-1">
              <h1 className="text-base md:text-lg font-bold bg-clip-text bg-gradient-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600 whitespace-nowrap">
                {t("pending_approvals")}
              </h1>
              {total !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  {total}
                </span>
              )}
            </div>
            <p
              className={clsx(
                "text-xs max-w-xs",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("pending_approvals_desc")}
            </p>
          </div>

          {/* Right: Horizontal Scrollable Stats Cards */}
          <div
            dir="ltr"
            className="flex-1 min-w-0 flex flex-row items-center gap-2 overflow-x-auto flex-nowrap py-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            <StatsMarquee
              stats={pendingStats}
              isLoading={isLoading}
              className="flex-1 min-w-0"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Error State */}
          {isError && (
            <div
              className={clsx(
                "mb-4 p-4 rounded-2xl border",
                isDark
                  ? "bg-red-900/20 border-red-700"
                  : "bg-red-50 border-red-200",
              )}
            >
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <span>
                  Failed to load pending approvals. Please check your
                  permissions or try again later.
                </span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
              </div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-gray-500">
                  Unable to load pending approvals
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Please ensure you have the correct permissions
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <TabsSection
                  tabs={tabs}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>

              {pendingItems.length === 0 ? (
                <div
                  className={clsx(
                    "text-center py-16 rounded-2xl border",
                    isDark
                      ? "border-gray-700 bg-gray-800/30"
                      : "border-gray-200 bg-gray-50",
                  )}
                >
                  <div
                    className={clsx(
                      "mb-2",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    ✓ {t("all_clear")}
                  </div>
                  <p className={isDark ? "text-gray-500" : "text-gray-600"}>
                    {t("no_pending_approvals")}
                  </p>
                </div>
              ) : (
                <ReordableDataTable
                  rowKey="_id"
                  data={pendingItems}
                  isDataLoading={isFetching}
                  onRowClick={(item) => handleViewDetails(item)}
                  storageKey="pendingApprovalsTableColumnOrder"
                  columns={columns}
                  hasMore={hasMore}
                  next={() => setPage((prev) => prev + 1)}
                />
              )}
            </>
          )}
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
                changedAt: changesData.createdAt || new Date(),
                status: changesData.status || "PENDING",
              }
            : undefined
        }
        isLoading={changesLoading}
        userRole={userRole as any}
        onApprove={async () => {
          setPage(1);
          setCombinedItems([]);
          await refetchApprovals();
        }}
      />
    </>
  );
}
