import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef } from "react";

import { routes } from "@/lib/routes";
import {
  BusinessGridView,
  BusinessListView,
  CreateBusinessWizard,
} from "./components";

import {
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Columns,
  UtensilsCrossed,
  Landmark,
  Theater,
  Map,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BulkActionBar,
  ConfirmDialog,
  PageHeader,
  PageStats,
  ViewModeToggle,
} from "@/components/shared";
import {
  useGetAllbusinessesQuery,
  useGetBusinessStatsQuery,
} from "@/store/api/businessQueryApi";
import { useBulkBusinessesUpdateMutation } from "@/store/api/businessMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import FilterChips from "@/components/shared/FilterChips";
import EmptyState from "@/components/shared/EmptyState";

// Column configuration
const defaultColumns = {
  impact: true,
  name: true,
  shortDescription: true,
  contactDetails: true,
  busiEmail: true,
  phoneNumber: true,
  productCount: true,
  status: true,
  lifetimeSales: true,
  tripCount: false,
  associatedWebsites: false,
  contactPhone: false,
  categories: false,
};

type ColumnVisibility = typeof defaultColumns;

// Column definitions with default status
const columnDefinitions = [
  { key: "impact" as keyof ColumnVisibility, isDefault: true },
  { key: "name" as keyof ColumnVisibility, isDefault: true },
  { key: "shortDescription" as keyof ColumnVisibility, isDefault: true },
  { key: "contactDetails" as keyof ColumnVisibility, isDefault: true },
  { key: "busiEmail" as keyof ColumnVisibility, isDefault: true },
  { key: "phoneNumber" as keyof ColumnVisibility, isDefault: true },
  { key: "productCount" as keyof ColumnVisibility, isDefault: true },
  { key: "status" as keyof ColumnVisibility, isDefault: true },
  { key: "lifetimeSales" as keyof ColumnVisibility, isDefault: true },
  { key: "tripCount" as keyof ColumnVisibility, isDefault: false },
  { key: "associatedWebsites" as keyof ColumnVisibility, isDefault: false },
  { key: "contactPhone" as keyof ColumnVisibility, isDefault: false },
  { key: "categories" as keyof ColumnVisibility, isDefault: false },
];

const LIMIT = 20;

export default function BusinessesMgmtPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("businesses");
  const { isDark, isRTL, language, bgSecondary, borderColor, textSecondary } =
    useThemeClasses();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { dmoId, authorityId, startDate, endDate, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  //infinite scroll states
  // const [page, setPage] = useState<number>(1);

  const [viewMode, setViewMode] = useState<"list" | "grid">(
    (localStorage.getItem("businessViewMode") as "list" | "grid") ?? "list",
  );

  const [error, _setError] = useState(false);
  // const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(
    new Set(),
  );
  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);

  // for setting filters to local storage
  const STORAGE_KEY = "business_query_state";
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  // Filters
  const [filters, setFilters] = useState({
    status: savedState?.filters?.status || "all",
    hasProductFilter: savedState?.filters?.hasProductFilter || "all",
  });

  const [searchTerm, setSearchTerm] = useState(savedState?.searchTerm || "");

  const [page, setPage] = useState(savedState?.page || 1);

  useEffect(() => {
    const queryState = {
      page,
      searchTerm,
      filters,
      dmoId,
      authorityId,
      startDate,
      endDate,
      websiteId,
      language,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queryState));
  }, [
    page,
    searchTerm,
    filters,
    dmoId,
    authorityId,
    startDate,
    endDate,
    websiteId,
    language,
  ]);

  const handleBusinessClick = (business: any) => {
    navigate(`${routes.businessDetails}?businessId=${business?._id}`, {
      replace: true,
    });
  };

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      dmoId,
      startDate,
      endDate,
      authorityId,
      limit: LIMIT,
      locale: language,
      externalApiId: websiteId,
    };

    if (searchTerm) params.search = searchTerm;

    if (filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.hasProductFilter !== "all") {
      params.hasProductFilter = filters.hasProductFilter === "yes";
    }

    return params;
  }, [
    page,
    searchTerm,
    filters,
    language,
    dmoId,
    authorityId,
    startDate,
    endDate,
    websiteId,
  ]);

  // Only append search, status, hasProductFilter to URL
  useEffect(() => {
    const urlParams: Record<string, any> = {};

    if (queryParams.search) urlParams.search = queryParams.search;
    if (queryParams.status) urlParams.status = queryParams.status;
    if (queryParams.hasProductFilter !== undefined)
      urlParams.hasProductFilter = queryParams.hasProductFilter;

    const searchParams = new URLSearchParams(urlParams).toString();
    navigate(`?${searchParams}`, { replace: true });
  }, [queryParams, navigate]);

  const statsQueryParams = useMemo(() => {
    const { page, limit, locale, ...rest } = queryParams;
    return rest;
  }, [queryParams, dmoId, authorityId, websiteId]);

  // Then call your query
  const { data: businessStatsData, isLoading: isStatsLoading } =
    useGetBusinessStatsQuery(statsQueryParams);

  const [bulkBusinessesUpdate, { isLoading: isDeleting }] =
    useBulkBusinessesUpdateMutation();

  const clearFilter = () => {
    localStorage.removeItem(STORAGE_KEY);

    setFilters({ status: "all", hasProductFilter: "all" });
    setSearchTerm("");
    setPage(1);
  };

  // Column visibility - load from localStorage or use defaults
  const [visibleColumns, _setVisibleColumns] = useState<ColumnVisibility>(
    () => {
      try {
        const saved = localStorage.getItem("businessesTableColumns");
        if (saved) {
          return { ...defaultColumns, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error("Failed to load column settings:", e);
      }
      return defaultColumns;
    },
  );

  // Close column settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(event.target as Node)
      ) {
        setShowColumnSettings(false);
      }
    };

    if (showColumnSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnSettings]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, dmoId, authorityId, startDate, endDate]);

  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);

  const {
    data: businessData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllbusinessesQuery(queryParams);

  const businesses = businessData?.data ?? [];
  const hasMore = businessData?.meta?.hasNextPage;
  const totalData = businessData?.totalData;

  useEffect(() => {
    if (page === 1) {
      setCombinedBusinesses(businesses);
    } else {
      setCombinedBusinesses((prev) => {
        // Prevent duplicates (important!)
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = businesses.filter((b: any) => !existingIds.has(b._id));

        return [...prev, ...newItems];
      });
    }
  }, [businesses]);

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev: any) => {
      return prev + 1;
    });
  };

  // Reset to default columns
  const resetToDefault = () => {
    setColumnVisibility(defaultColumns);
  };
  const promptBulkDelete = () => {
    if (selectedBusinesses.size === 0) return;
    setIsBulkDelete(true); // mark bulk delete mode
    setIsConfirmOpen(true); // open confirmation dialog
  };
  const handleBulkDelete = async () => {
    if (!selectedBusinesses.size) return;
    setIsConfirmOpen(true);
    const toastId = toast.loading("Please wait. Businesses are deleting...");
    try {
      const results = await bulkBusinessesUpdate({
        businessesId: Array.from(selectedBusinesses),
        isDeleted: true,
      });

      if (results?.data) {
        const message = "Businesses deleted successfully";
        toast.success(message, { id: toastId });
        setSelectedBusinesses(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete Businesses", {
        id: toastId,
      });
    }
  };

  const handleBulkStatusChange = async (status: TStatus) => {
    if (!selectedBusinesses.size) return;
    const toastId = toast.loading(
      "Please wait. Businesses's status are changing...",
    );

    try {
      const results = await bulkBusinessesUpdate({
        businessesId: Array.from(selectedBusinesses),
        status: status?.toLocaleUpperCase(),
      });

      if (results?.data) {
        const message = "Businesses status updated successfully";
        toast.success(message, { id: toastId });
        setSelectedBusinesses(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to change Businesses status", {
        id: toastId,
      });
    }
  };

  const handleExport = () => {
    // 1. Determine which businesses to export
    const businessesToExport =
      selectedBusinesses.size > 0
        ? (businessData?.data?.filter((business: any) =>
            selectedBusinesses.has(business._id),
          ) ?? [])
        : (businessData?.data ?? []);

    if (businessesToExport.length === 0) {
      alert(t("noBusinessesToExport") || "No businesses to export");
      return;
    }

    // 2. CSV escaping utility
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // 3. Build headers & corresponding keys based on visible columns
    const headers: string[] = [];
    const columnKeys: string[] = [];

    if (visibleColumns.impact) {
      headers.push(t("impactScore"));
      columnKeys.push("impact");
    }
    if (visibleColumns.name) {
      headers.push(t("businessName"));
      columnKeys.push("name"); // actual field is .name
    }
    if (visibleColumns.shortDescription) {
      headers.push(t("shortDescription"));
      columnKeys.push("shortDescription");
    }
    if (visibleColumns.contactDetails) {
      headers.push(t("contactPerson"));
      columnKeys.push("contactName");
    }
    if (visibleColumns.busiEmail) {
      headers.push(t("businessEmail"));
      columnKeys.push("busiEmail"); // field name in data
    }
    if (visibleColumns.phoneNumber) {
      headers.push(t("phoneNumber"));
      columnKeys.push("phoneNumber");
    }
    if (visibleColumns.productCount) {
      headers.push(t("productsCount"));
      columnKeys.push("productCount"); // field name in data
    }
    if (visibleColumns.status) {
      headers.push(t("status"));
      columnKeys.push("status");
    }
    if (visibleColumns.lifetimeSales) {
      headers.push(t("lifetimeSales"));
      columnKeys.push("lifetimeSales");
    }
    if (visibleColumns.tripCount) {
      headers.push(t("tripCount"));
      columnKeys.push("tripCount");
    }
    if (visibleColumns.associatedWebsites) {
      headers.push(t("websiteUrl"));
      columnKeys.push("associatedWebsites");
    }
    if (visibleColumns.contactPhone) {
      headers.push(t("contactPhone"));
      columnKeys.push("contactPhone");
    }
    if (visibleColumns.categories) {
      headers.push(t("categories"));
      columnKeys.push("categories");
    }

    // 4. Build CSV content
    let csvContent = headers.map(escapeCSV).join(",") + "\n";

    businessesToExport.forEach((business: any) => {
      const row: string[] = [];

      columnKeys.forEach((key) => {
        let value: any;

        switch (key) {
          case "impactScore":
            value = business.impact ?? 0;
            break;
          case "name":
            value =
              business.name || business.slug || t("unnamed_business") || "-";
            break;
          case "busiEmail":
            value = business.busiEmail || "-";
            break;
          case "phoneNumber":
            value = business.phoneNumber || "-";
            break;
          case "productCount":
            value = business.productCount ?? 0;
            break;
          case "status":
            value = business.status || "unknown";
            break;
          case "tripCount":
            value = business.tripCount ?? getTripCount(business); // fallback to your helper
            break;
          case "websiteUrl": {
            // Pick first valid URL if array
            const sites = business.associatedWebsites || [];
            value = sites?.find((s: any) => s.url)?.url || "-";
            break;
          }
          case "categories": {
            value = Array.isArray(business.categories)
              ? business.categories.join(", ")
              : "-";
            break;
          }
          case "lifetimeSales":
          case "shortDescription":
          case "contactName":
          case "contactPhone":
            // Add these fields when they exist in your real data
            value = business[key] ?? "-";
            break;
          default:
            value = "-";
        }

        row.push(escapeCSV(value));
      });

      csvContent += row.join(",") + "\n";
    });

    // 5. Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute("href", url);
    link.setAttribute("download", `businesses_export_${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mock calculation based on products count and impact score
  const getTripCount = (business: any): number => {
    return Math.floor((business.productCount * business.impact) / 10);
  };

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3
            className={`text-xl mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {t("error_loading_businesses")}
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            {t("retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  const businessStats = [
    {
      id: 1,
      title: t("total_businesses") || "Total Businesses",
      value: businessStatsData?.totalBusinesses,
      label: t("registered") || "Registered",
      icon: <Map className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 2,
      title: t("active_businesses") || "Active Businesses",
      value: businessStatsData?.activeBusinesses,
      label: t("approved") || "Approved",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    {
      id: 3,
      title: t("total_products") || "Total Products",
      value: businessStatsData?.totalProducts,
      label: t("listed") || "Listed",
      icon: <UtensilsCrossed className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 4,
      title: t("avg_impact") || "Avg. Impact",
      value: businessStatsData?.averageImpactScore,
      label: t("score") || "Score",
      icon: <Theater className="w-5 h-5 text-orange-600" />,
    },
    {
      id: 5,
      title: t("pending_approval") || "Pending Approval",
      value: businessStatsData?.pendingApproval,
      label: t("awaiting") || "Awaiting",
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    },
    {
      id: 6,
      title: t("avg_completion") || "Avg. Completion",
      value: businessStatsData?.averageCompletion,
      label: t("profile_data") || "Profile Data",
      icon: <Landmark className="w-5 h-5 text-teal-600" />,
    },
  ];

  return (
    <>
      <div className="flex flex-col  ">
        {/* Sticky Header */}
        <div
          className={`border-b ${
            isDark ? " border-gray-800" : "bg-transparent border-gray-200"
          } z-10`}
        >
          <PageHeader
            title={t("businesses_management")}
            description={t("businesses_management_desc")}
            btnLabel={t("add_business")}
            onClick={() => setIsCreateModalOpen(true)}
            h1Gradient="bg-linear-to-r  text-transparent from-blue-500 via-indigo-600 to-purple-600"
            totalCount={totalData ?? 0}
          />
          <PageStats
            stats={businessStats}
            isLoading={isStatsLoading}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          />

          {/* Search and Filters */}
          <div className="py-4 flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_businesses_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                // storageKey="businessSearchTerm"
              />
            </div>

            <FilterButton value={showFilters} onChange={setShowFilters} />

            {/* Column Settings */}
            {viewMode === "list" && (
              <div className="relative" ref={columnSettingsRef}>
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Columns className="w-5 h-5" />
                  {t("show_columns")}
                  {showColumnSettings ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Column Settings Dropdown */}
                {showColumnSettings && (
                  <div
                    className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 rounded-lg shadow-lg max-h-50vh overflow-y-auto border z-50 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                  >
                    <div
                      className={`p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}
                        >
                          {t("column_settings") || "Column Settings"}
                        </h3>
                        <button
                          onClick={resetToDefault}
                          className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          {t("reset_to_default") || "Reset to Default"}
                        </button>
                      </div>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {t("select_columns_to_display") ||
                          "Select columns to display"}
                      </p>
                    </div>
                    <div className="p-3 max-h-96 overflow-y-auto">
                      {/* Default Columns */}
                      {Object.entries(columnVisibility)
                        .filter(
                          ([key]) =>
                            columnDefinitions.find((col) => col.key === key)
                              ?.isDefault,
                        )
                        .map(([key, visible]) => (
                          <label
                            key={key}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer  dark:hover:bg-gray-700 ${
                              isRTL ? "flex-row-reverse justify-end" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={visible}
                              onChange={(e) =>
                                setColumnVisibility((prev) => ({
                                  ...prev,
                                  [key]: e.target.checked,
                                }))
                              }
                              className="rounded"
                            />
                            <span className={`text-sm ${textSecondary}`}>
                              {t(key as keyof typeof t)}
                            </span>
                          </label>
                        ))}

                      {/* Divider */}
                      {columnDefinitions.some((col) => !col.isDefault) && (
                        <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
                      )}

                      {/* Non-default Columns */}
                      <p
                        className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Optional Columns
                      </p>
                      {Object.entries(columnVisibility)
                        .filter(
                          ([key]) =>
                            !columnDefinitions.find((col) => col.key === key)
                              ?.isDefault,
                        )
                        .map(([key, visible]) => (
                          <label
                            key={key}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              isRTL ? "flex-row-reverse justify-end" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={visible}
                              onChange={(e) =>
                                setColumnVisibility((prev) => ({
                                  ...prev,
                                  [key]: e.target.checked,
                                }))
                              }
                              className="rounded"
                            />
                            <span className={`text-sm ${textSecondary}`}>
                              {t(key as keyof typeof t)}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export */}
            <button
              onClick={handleExport}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                isDark
                  ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Download className="w-5 h-5" />
              {t("export")}
            </button>
            <ViewModeToggle
              onChange={setViewMode}
              value={viewMode}
              tableName="businessViewMode"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div
              className={` border-t ${
                isDark
                  ? "border-gray-800 bg-gray-900/30"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ml-4 mt-4">
                {/* Status Filter */}
                <div>
                  <label
                    className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("status")}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="all">{t("all")}</option>
                    <option value="DRAFT">{t("draft")}</option>
                    <option value="PENDING">{t("pending")}</option>
                    <option value="APPROVED">{t("approved")}</option>
                    <option value="REJECTED">{t("rejected")}</option>
                    <option value="CLOSED">{t("closed")}</option>
                  </select>
                </div>

                {/* Has Products Filter */}
                <div>
                  <label
                    className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("has_products")}
                  </label>
                  <select
                    value={filters.hasProductFilter}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        hasProductFilter: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="all">{t("all")}</option>
                    <option value="yes">{t("yes")}</option>
                    <option value="no">{t("no")}</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4  pt-2">
                <button
                  onClick={clearFilter}
                  className=" px-4 py-2 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {t("clear_all")}
                </button>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    // Skip rendering empty filters
                    if (!value || value === "all") return null;

                    let displayValue = value;
                    if (key === "status") {
                      displayValue = t(value.toLowerCase()) || value;
                    } else if (key === "hasProductFilter") {
                      displayValue = value === "yes" ? t("yes") : t("no");
                    }

                    return (
                      <FilterChips
                        key={key}
                        label={displayValue}
                        onRemove={() => {
                          if (key === "status") {
                            setFilters((prev) => ({ ...prev, status: "all" }));
                          } else {
                            setFilters((prev) => ({ ...prev, [key]: "" }));
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <BulkActionBar
            selectedItemCount={selectedBusinesses.size || 0}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
          />
        </div>
        <div className="flex-1 overflow-y-auto mt-2">
          {combinedBusinesses?.length === 0 && !(isFetching || isLoading) ? (
            <div
              className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
            >
              <EmptyState searchQuery={searchTerm} />
            </div>
          ) : viewMode === "list" ? (
            <BusinessListView
              t={t}
              hasMore={hasMore}
              next={fetchNextPage}
              isLoading={isLoading || isFetching}
              columnVisibility={columnVisibility}
              businesses={combinedBusinesses || []}
              onBusinessClick={handleBusinessClick}
              selectedBusinesses={selectedBusinesses}
              setSelectedBusinesses={setSelectedBusinesses}
            />
          ) : (
            <div className="overflow-y-auto ">
              <BusinessGridView
                t={t}
                refetch={refetch}
                hasMore={hasMore}
                next={fetchNextPage}
                data={combinedBusinesses || []}
                onRowClick={handleBusinessClick}
                isLoading={isLoading || isFetching}
              />
            </div>
          )}
        </div>
        <ConfirmDialog
          open={isConfirmOpen}
          title={t("delete_business")}
          message={t("delete_business_confirm")}
          confirmText="delete"
          loading={isDeleting}
          variant="danger"
          onCancel={() => {
            setIsConfirmOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={() => {
            setIsConfirmOpen(false);

            if (isBulkDelete) {
              handleBulkDelete();
              setIsBulkDelete(false);
              setIsConfirmOpen(false);
            } else {
              if (!itemToDelete) return;
              setItemToDelete(null);
            }
          }}
        />
      </div>

      {isCreateModalOpen && (
        <CreateBusinessWizard
          onClose={() => setIsCreateModalOpen(false)}
          refetch={refetch}
        />
      )}
    </>
  );
}
