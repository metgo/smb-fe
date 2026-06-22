import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { routes } from "@/lib/routes";
import {
  BusinessGridView,
  BusinessListView,
  CreateBusinessWizard,
} from "./components";

import {
  Download,
  CheckCircle,
  AlertCircle,
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
  ShowColumns,
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
import { FilterByStatus } from "@/components/filter-fields";

// Constants & Types
const LIMIT = 20;
const STORAGE_KEY = "business_query_state";
const COLUMNS_STORAGE_KEY = "businessesTableColumns";
const SEARCH_STORAGE_KEY = "businessSearchTerm";

const defaultColumns: IBusinessColumnVisibility = {
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

const columnDefinitions: Array<{
  key: keyof IBusinessColumnVisibility;
  isDefault: boolean;
}> = [
  { key: "impact", isDefault: true },
  { key: "name", isDefault: true },
  { key: "shortDescription", isDefault: true },
  { key: "contactDetails", isDefault: true },
  { key: "busiEmail", isDefault: true },
  { key: "phoneNumber", isDefault: true },
  { key: "productCount", isDefault: true },
  { key: "status", isDefault: true },
  { key: "lifetimeSales", isDefault: true },
  { key: "tripCount", isDefault: false },
  { key: "associatedWebsites", isDefault: false },
  { key: "contactPhone", isDefault: false },
  { key: "categories", isDefault: false },
];

// Main Component
export default function BusinessesMgmtPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("businesses");
  const { t: tc } = useTranslation("toast");
  const { isDark, language, bgSecondary, borderColor } = useThemeClasses();

  // Auth state
  const { dmoId, authorityId, startDate, endDate, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  // ─── Local State ─────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    hasProductFilter: "all" as const,
  });
  const [columnVisibility, setColumnVisibility] =
    useState<IBusinessColumnVisibility>(defaultColumns);
  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);

  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const hasSavedFilters =
    filters.hasProductFilter !== "all" || filters.status !== "all";

  // ─── Load persisted state on mount (safe, no render loop) ─────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved?.filters) setFilters(saved.filters);
      if (saved?.searchTerm) setSearchTerm(saved.searchTerm);
      if (saved?.page) setPage(saved.page);
      if (saved?.viewMode) setViewMode(saved.viewMode);
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
  }, []);

  // Load column visibility
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setColumnVisibility((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load column settings:", e);
    }
  }, []);

  // ─── Persist state to localStorage (debounced via effect) ─────────
  useEffect(() => {
    const queryState = { page, filters, searchTerm, viewMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queryState));
  }, [page, filters, searchTerm, viewMode]);

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // useEffect(() => {
  //   if (searchTerm) {
  //     localStorage.setItem(SEARCH_STORAGE_KEY, searchTerm);
  //   } else {
  //     localStorage.removeItem(SEARCH_STORAGE_KEY);
  //   }
  // }, [searchTerm]);

  // ─── Close column dropdown on outside click ─────────
  useEffect(() => {
    if (!showColumnSettings) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(event.target as Node)
      ) {
        setShowColumnSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnSettings]);

  // ─── Reset page when filters/search change ─────────
  useEffect(() => {
    setPage(1);
    setCombinedBusinesses(businessData?.data);
  }, [searchTerm, filters, dmoId, authorityId, startDate, endDate]);

  // ─── Query Parameters (memoized, stable reference) ─────────
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      dmoId,
      // startDate,
      // endDate,
      authorityId,
      limit: LIMIT,
      locale: language,
      externalApiId: websiteId,
    };
    const finalSearchTerm =
      localStorage.getItem(SEARCH_STORAGE_KEY) ?? searchTerm;
    if (finalSearchTerm) params.search = finalSearchTerm;
    if (filters.status !== "all") params.status = filters.status;
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
    // startDate,
    // endDate,
    websiteId,
  ]);

  // ─── API Queries ─────────
  const statsQueryParams = useMemo(() => {
    const { page, limit, locale, ...rest } = queryParams;
    return rest;
  }, [queryParams]);

  const { data: businessStatsData, isLoading: isStatsLoading } =
    useGetBusinessStatsQuery(statsQueryParams, {
      refetchOnMountOrArgChange: true,
    });

  const {
    data: businessData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllbusinessesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [bulkBusinessesUpdate, { isLoading: isDeleting }] =
    useBulkBusinessesUpdateMutation();

  const hasMore = businessData?.meta?.hasNextPage;
  const totalData = businessData?.totalData;

  // ─── Infinite Scroll: Merge new data safely ─────────
  useEffect(() => {
    if (!businessData?.data?.length) {
      setCombinedBusinesses([]);
      return;
    }

    setCombinedBusinesses((prev) => {
      if (page === 1) return businessData?.data;
      const existingIds = new Set(prev.map((b) => b._id));
      const newItems = businessData?.data?.filter(
        (b: any) => !existingIds.has(b._id),
      );
      return newItems?.length ? [...prev, ...newItems] : prev;
    });
  }, [businessData, page]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  // ─── Handlers (memoized to prevent re-renders) ─────────
  const handleBusinessClick = useCallback(
    (business: any) => {
      navigate(`${routes.businessDetails}?businessId=${business?._id}`, {
        replace: true,
      });
    },
    [navigate],
  );

  const clearFilter = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEARCH_STORAGE_KEY);
    setFilters({ status: "all", hasProductFilter: "all" });
    setSearchTerm("");
    setPage(1);
  }, []);

  const resetToDefault = useCallback(() => {
    setColumnVisibility(defaultColumns);
  }, []);

  const promptBulkDelete = useCallback(() => {
    if (!selectedBusinesses.size) return;
    setIsBulkDelete(true);
    setIsConfirmOpen(true);
  }, [selectedBusinesses.size]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedBusinesses.size) return;
    console.log(
      "🚀 ~ BusinessesMgmtPage ~ selectedBusinesses:",
      selectedBusinesses,
    );

    const toastId = toast.loading(tc("business_delete_loading"));
    try {
      const results = await bulkBusinessesUpdate({
        businessesId: Array.from(selectedBusinesses),
        isDeleted: true,
      });
      if (results?.data) {
        toast.success(tc("business_deleted_success"), { id: toastId });
        setSelectedBusinesses(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || tc("business_delete_failed"), {
        id: toastId,
      });
    } finally {
      setIsConfirmOpen(false);
      setIsBulkDelete(false);
    }
  }, [selectedBusinesses, bulkBusinessesUpdate, refetch, tc]);

  const handleBulkStatusChange = useCallback(
    async (status: TStatus) => {
      if (!selectedBusinesses.size) return;
      const toastId = toast.loading(tc("business_status_change_loading"));
      try {
        const results = await bulkBusinessesUpdate({
          businessesId: Array.from(selectedBusinesses),
          status: status?.toLocaleUpperCase(),
        });
        if (results?.data) {
          toast.success(tc("business_status_update_success"), { id: toastId });
          setSelectedBusinesses(new Set());
          refetch();
        }
      } catch (error: any) {
        toast.error(error?.message || tc("business_status_update_failed"), {
          id: toastId,
        });
      }
    },
    [selectedBusinesses, bulkBusinessesUpdate, refetch, tc],
  );

  // ─── Export Logic (extracted for clarity) ─────────
  const handleExport = useCallback(() => {
    const businessesToExport =
      selectedBusinesses.size > 0
        ? (businessData?.data?.filter((b: any) =>
            selectedBusinesses.has(b._id),
          ) ?? [])
        : (businessData?.data ?? []);

    if (!businessesToExport?.length) {
      toast.info(t("noBusinessesToExport") || "No businesses to export");
      return;
    }

    const escapeCSV = (value: any): string => {
      if (value == null) return "";
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const columns = Object.entries(columnVisibility)
      .filter(([_, visible]) => visible)
      .map(([key]) => key as keyof IBusinessColumnVisibility);

    const headers = columns.map((key) => t(key));
    const csvRows = businessesToExport.map((business: any) =>
      columns
        .map((key) => {
          let value: any = business[key];
          if (key === "associatedWebsites") {
            value = business.associatedWebsites?.[0]?.url || "-";
          } else if (key === "categories" && Array.isArray(value)) {
            value = value.join(", ");
          } else if (key === "tripCount" && value == null) {
            value = Math.floor((business.productCount * business.impact) / 10);
          }
          return escapeCSV(value ?? "-");
        })
        .join(","),
    );

    const csvContent = [headers.map(escapeCSV).join(","), ...csvRows].join(
      "\n",
    );
    const blob = new Blob(["﻿", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `businesses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [selectedBusinesses, businessData, columnVisibility, t]);

  // ─── Stats Cards ─────────
  const businessStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total_businesses"),
        value: businessStatsData?.totalBusinesses,
        label: t("registered"),
        icon: <Map className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 2,
        title: t("active_businesses"),
        value: businessStatsData?.activeBusinesses,
        label: t("approved"),
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      },
      {
        id: 3,
        title: t("total_products"),
        value: businessStatsData?.totalProducts,
        label: t("listed"),
        icon: <UtensilsCrossed className="w-5 h-5 text-blue-600" />,
      },
      {
        id: 4,
        title: t("avg_impact"),
        value: businessStatsData?.averageImpactScore,
        label: t("score"),
        icon: <Theater className="w-5 h-5 text-orange-600" />,
      },
      {
        id: 5,
        title: t("pending_approval"),
        value: businessStatsData?.pendingApproval,
        label: t("awaiting"),
        icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      },
      {
        id: 6,
        title: t("avg_completion"),
        value: businessStatsData?.averageCompletion,
        label: t("profile_data"),
        icon: <Landmark className="w-5 h-5 text-teal-600" />,
      },
    ],
    [businessStatsData, t],
  );

  // ─── Render ─────────
  return (
    <>
      <div className="flex flex-col pt-10 md:pt-0">
        {/* Sticky Header */}
        <div
          className={`border-b ${isDark ? "border-gray-800" : "bg-transparent border-gray-200"} z-10`}
        >
          <PageHeader
            title={t("businesses_management")}
            description={t("businesses_management_desc")}
            btnLabel={t("add_business")}
            onClick={() => setIsCreateModalOpen(true)}
            h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600"
            totalCount={totalData ?? 0}
          />
          <PageStats
            stats={businessStats}
            isLoading={isStatsLoading}
            className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-4"
          />

          {/* Search & Actions */}
          <div className="py-3 flex flex-col gap-2">
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_businesses_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>

            <div className="flex items-center  justify-between gap-2 w-full">
              <div className="flex items-center gap-2">
                <FilterButton value={showFilters} onChange={setShowFilters} />
                <ShowColumns
                  t={t}
                  viewMode={viewMode}
                  columnDefinitions={columnDefinitions}
                  columnVisibility={columnVisibility}
                  showColumnSettings={showColumnSettings}
                  setShowColumnSettings={setShowColumnSettings}
                  setColumnVisibility={setColumnVisibility}
                  resetToDefault={resetToDefault}
                />

                <button
                  onClick={handleExport}
                  className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-colors text-sm ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{t("export")}</span>
                </button>
              </div>

              <ViewModeToggle
                onChange={(mode) => {
                  setViewMode(mode);
                  localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
                      viewMode: mode,
                    }),
                  );
                }}
                value={viewMode}
                tableName="businessViewMode"
              />
            </div>
          </div>

          {/* Filters Panel */}
          {(showFilters || hasSavedFilters) && (
            <div
              className={`border-t py-2 ${isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex flex-wrap items-start gap-3 px-3 w-full">
                <FilterByStatus filters={filters} setFilters={setFilters} />
                <div className="flex flex-col flex-1 min-w-35">
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
                        hasProductFilter: e.target.value as any,
                      })
                    }
                    className={`w-full px-2 py-1.5 text-sm rounded-lg border ${
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
                {hasSavedFilters && (
                  <div className="flex flex-col w-full sm:w-auto">
                    <label
                      className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {t("active_filters")}
                    </label>
                    <div className="flex gap-2 items-center flex-wrap">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(filters).map(
                          ([key, value]) =>
                            value !== "all" && (
                              <FilterChips
                                key={key}
                                label={t(
                                  value === "yes" || value === "no"
                                    ? value
                                    : value.toLowerCase(),
                                )}
                                onRemove={() =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    [key]: "all",
                                  }))
                                }
                              />
                            ),
                        )}
                      </div>
                      <button
                        onClick={clearFilter}
                        className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors shrink-0"
                      >
                        {t("clear_all")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <BulkActionBar
            selectedItemCount={selectedBusinesses.size}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
            hancleClearSelection={() => setSelectedBusinesses(new Set())}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mt-2">
          {!isLoading && !isFetching && combinedBusinesses?.length === 0 ? (
            <div
              className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
            >
              <EmptyState searchQuery={searchTerm} />
            </div>
          ) : viewMode === "list" ? (
            <BusinessListView
              t={t}
              hasMore={!!hasMore}
              next={fetchNextPage}
              isLoading={isLoading}
              columnVisibility={columnVisibility}
              businesses={combinedBusinesses}
              onBusinessClick={handleBusinessClick}
              selectedBusinesses={selectedBusinesses}
              setSelectedBusinesses={setSelectedBusinesses}
            />
          ) : (
            <BusinessGridView
              refetch={refetch}
              hasMore={!!hasMore}
              next={fetchNextPage}
              data={combinedBusinesses}
              onRowClick={handleBusinessClick}
              isLoading={isLoading || isFetching}
              selectedItems={selectedBusinesses}
              setSelectedItems={setSelectedBusinesses}
            />
          )}
        </div>

        {/* Modals */}
        <ConfirmDialog
          open={isConfirmOpen}
          title={t("delete_business")}
          message={t("delete_business_confirm")}
          confirmText="delete"
          loading={isDeleting}
          variant="danger"
          onCancel={() => {
            setIsConfirmOpen(false);
            setIsBulkDelete(false);
          }}
          onConfirm={() => {
            if (isBulkDelete) {
              handleBulkDelete();
            }
            setIsConfirmOpen(false);
          }}
        />
        {isCreateModalOpen && (
          <CreateBusinessWizard
            onClose={() => setIsCreateModalOpen(false)}
            refetch={refetch}
          />
        )}
      </div>
    </>
  );
}
