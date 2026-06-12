import { useState, useMemo, useEffect } from "react";
import {
  Package,
  Store,
  Calendar,
  MapPin,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetPendingApprovalsQuery } from "@/store/api/businessQueryApi";
import { StatusPill } from "@/components/pills";
import { routes } from "@/lib/routes";
import TabsSection from "@/components/shared/TabsSection";
import PageStats from "@/components/shared/PageStats";
import PageHeader from "@/components/shared/PageHeader";
import { ReordableDataTable } from "@/components/shared";

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
    // case "order":
    //   return <ShoppingCart size={16} className="text-red-500" />;
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
    // case "order":
    //   return t("order");
    default:
      return "Item";
  }
};

const stripHtmlTags = (html: string | undefined) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

export default function PendingApprovalsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("pending_approvals");
  const { isDark, language } = useThemeClasses();
  const [page, setPage] = useState(1);
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

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

  const {
    data: approvalsData,
    isLoading,
    isFetching,
    isError,
  } = useGetPendingApprovalsQuery(
    {
      page,
      limit: LIMIT,
    },
    {
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

  // Auto-load more pages if current tab is empty but has more data available
  useEffect(() => {
    // Keep loading pages until we find items for this tab or run out of pages
    if (
      activeTab !== "all" &&
      pendingItems.length === 0 &&
      hasMore &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  }, [activeTab, pendingItems.length, hasMore, isFetching]);

  const pendingStats = useMemo(() => {
    return [
      {
        id: 1,
        title: t("total"),
        value: total,
        icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      },
      {
        id: 2,
        title: t("total_businesses"),
        value: apiCounts.business,
        label: t("pending"),
        icon: <Store className="w-5 h-5 text-blue-600" />,
      },
      {
        id: 3,
        title: t("total_products"),
        value: apiCounts.product,
        label: t("pending"),
        icon: <Package className="w-5 h-5 text-green-600" />,
      },
      {
        id: 4,
        title: t("total_events"),
        value: apiCounts.event,
        label: t("pending"),
        icon: <Calendar className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 5,
        title: t("total_pois"),
        value: apiCounts.poi,
        label: t("pending"),
        icon: <MapPin className="w-5 h-5 text-orange-600" />,
      },
    ];
  }, [total, apiCounts, t]);

  // Define columns for ReordableDataTable
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
            {item.name
              ? (item.name?.[language] ?? item.name?.en ?? item.name)
              : "-"}
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
            {stripHtmlTags(item.shortDescription || item.description) || "-"}
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
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        key: "actions",
        label: t("action"),
        render: (item: any) => (
          <button
            onClick={() => handleViewDetails(item)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <Eye size={16} />
            <span className="text-sm">{t("view")}</span>
          </button>
        ),
      },
    ],
    [isDark, language, t],
  );

  return (
    <div className="flex flex-col pt-10 md:pt-0">
      {/* Sticky Header */}
      <div
        className={`border-b ${isDark ? "border-gray-800" : "bg-transparent border-gray-200"} z-10`}
      >
        <PageHeader
          title={t("pending_approvals")}
          description={t("pending_approvals_desc")}
          totalCount={total}
          h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600"
        />
        <PageStats
          stats={pendingStats}
          isLoading={isLoading}
          className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-4"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto mt-2">
        {/* Error State */}
        {isError && (
          <div
            className={`mb-6 p-4 rounded-lg border ${isDark ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"}`}
          >
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <span>
                Failed to load pending approvals. Please check your permissions
                or try again later.
              </span>
            </div>
          </div>
        )}

        {/* Items List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              {/* <p className="text-gray-500">{t("loading_pending_approvals")}</p> */}
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-gray-500">Unable to load pending approvals</p>
              <p className="text-sm text-gray-400 mt-2">
                Please ensure you have the correct permissions
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <TabsSection
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            {pendingItems.length === 0 ? (
              <div
                className={`text-center py-16 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50"}`}
              >
                <div
                  className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}
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
  );
}
