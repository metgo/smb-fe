import { useState, useMemo, useEffect, useRef } from "react";
import { Package, Store, Calendar, MapPin, AlertCircle } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetPendingApprovalsQuery } from "@/store/api/businessQueryApi";
import { StatusPill } from "@/components/pills";

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

const getItemTypeLabel = (type: string) => {
  switch (type) {
    case "business":
      return "Business";
    case "product":
      return "Product";
    case "event":
      return "Event";
    case "poi":
      return "POI";
    // case "order":
    //   return "Order";
    default:
      return "Item";
  }
};

export default function PendingApprovalsPage() {
  const { isDark, borderColor, textPrimary } = useThemeClasses();
  const [page, setPage] = useState(1);
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data: approvalsData,
    isLoading,
    isFetching,
    isError,
  } = useGetPendingApprovalsQuery({
    page,
    limit: LIMIT,
  });

  const hasMore = approvalsData?.meta?.hasNextPage;
  const total = approvalsData?.meta?.total || 0;

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

  const pendingItems = combinedItems;

  // Keep isFetching ref in sync
  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  const stats = useMemo(() => {
    return {
      business: pendingItems.filter((item: any) => item.type === "business")
        .length,
      product: pendingItems.filter((item: any) => item.type === "product")
        .length,
      event: pendingItems.filter((item: any) => item.type === "event").length,
      poi: pendingItems.filter((item: any) => item.type === "poi").length,
      // order: pendingItems.filter((item: any) => item.type === "order").length,
    };
  }, [pendingItems]);

  // Infinite scroll handler
  useEffect(() => {
    if (!sentinel || !hasMore) return;

    // Disconnect old observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.05, rootMargin: "100px" },
    );

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [sentinel, hasMore]);

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`${isDark ? "bg-gray-800" : "bg-white"} border-b ${borderColor} mb-6`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1
            className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Pending Approvals
          </h1>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Review pending items across all entity types
          </p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
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

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div
            className={`p-4 rounded-lg border transition ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-xs sm:text-sm text-gray-500 mb-2">Total</div>
            <div className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
              {total}
            </div>
          </div>
          <div
            className={`p-4 rounded-lg border transition ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-blue-600"
                : "bg-white border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              <Store size={12} className="text-blue-500" />
              <span className="text-xs sm:text-sm text-gray-500">
                Businesses
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
              {stats.business}
            </div>
          </div>
          <div
            className={`p-4 rounded-lg border transition ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-green-600"
                : "bg-white border-gray-200 hover:border-green-300"
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              <Package size={12} className="text-green-500" />
              <span className="text-xs sm:text-sm text-gray-500">Products</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
              {stats.product}
            </div>
          </div>
          <div
            className={`p-4 rounded-lg border transition ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-purple-600"
                : "bg-white border-gray-200 hover:border-purple-300"
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              <Calendar size={12} className="text-purple-500" />
              <span className="text-xs sm:text-sm text-gray-500">Events</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
              {stats.event}
            </div>
          </div>
          <div
            className={`p-4 rounded-lg border transition ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-orange-600"
                : "bg-white border-gray-200 hover:border-orange-300"
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              <MapPin size={12} className="text-orange-500" />
              <span className="text-xs sm:text-sm text-gray-500">POIs</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
              {stats.poi}
            </div>
          </div>
          {/* <div
            className={`p-4 rounded-lg border transition ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-red-600"
                : "bg-white border-gray-200 hover:border-red-300"
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              <ShoppingCart size={12} className="text-red-500" />
              <span className="text-xs sm:text-sm text-gray-500">Orders</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
              {stats.order}
            </div>
          </div> */}
        </div>

        {/* Items List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading pending approvals...</p>
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
        ) : pendingItems.length === 0 ? (
          <div
            className={`text-center py-16 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50"}`}
          >
            <div
              className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}
            >
              ✓ All Clear
            </div>
            <p className={isDark ? "text-gray-500" : "text-gray-600"}>
              No pending approvals at this time
            </p>
          </div>
        ) : (
          <div className={`rounded-lg overflow-hidden border ${borderColor}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`${
                      isDark ? "bg-gray-800" : "bg-gray-100"
                    } border-b ${borderColor}`}
                  >
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-900"}`}
                    >
                      Type
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-900"}`}
                    >
                      Name
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-900"}`}
                    >
                      Description
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-900"}`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-900"}`}
                    >
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.map((item: any, idx: number) => (
                    <tr
                      key={`${item.type}-${item._id}-${idx}`}
                      className={`border-b ${borderColor} ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                      } transition`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getItemTypeIcon(item.type)}
                          <span
                            className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}
                          >
                            {getItemTypeLabel(item.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
                        >
                          {item.nameHe || item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm truncate max-w-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        >
                          {item.shortDescription || item.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div
                ref={setSentinel}
                className={`flex items-center justify-center min-h-20 border-t ${borderColor} ${
                  isDark ? "bg-gray-900" : "bg-gray-50"
                }`}
              >
                {isFetching && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <div
                      className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Loading more items...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
