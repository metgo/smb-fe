import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { routes } from "@/lib/routes";
import {
  PoiGridView,
  PoiListView,
  CreatePoiWizard,
  ExportPoiButton,
} from "./components";

import { CheckCircle, AlertCircle, MapPin, Landmark } from "lucide-react";

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
  useGetAllPOIQuery,
  useGetPoiStatsQuery,
} from "@/store/api/poiQueryApi";
import { useBulkPoisUpdateMutation } from "@/store/api/poiMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import FilterChips from "@/components/shared/FilterChips";
import EmptyState from "@/components/shared/EmptyState";
import { FilterByStatus } from "@/components/filter-fields";

const LIMIT = 20;
const STORAGE_KEY = "poi_query_state";
const COLUMNS_STORAGE_KEY = "poisTableColumns";
const SEARCH_STORAGE_KEY = "poiSearchTerm";

type ColumnVisibility = {
  impact: boolean;
  name: boolean;
  shortDescription: boolean;
  address: boolean;
  status: boolean;
};

const defaultColumns: ColumnVisibility = {
  impact: true,
  name: true,
  shortDescription: true,
  address: true,
  status: true,
};

const columnDefinitions: Array<{
  key: keyof ColumnVisibility;
  isDefault: boolean;
}> = [
  { key: "impact", isDefault: true },
  { key: "name", isDefault: true },
  { key: "shortDescription", isDefault: true },
  { key: "address", isDefault: true },
  { key: "status", isDefault: true },
];

export default function PoiMgmtPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("poi");
  const { t: tc } = useTranslation("toast");
  const { isDark, language, bgSecondary, borderColor } = useThemeClasses();

  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedPois, setSelectedPois] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "all" });
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);
  const [combinedPois, setCombinedPois] = useState<any[]>([]);

  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const hasSavedFilters = filters.status !== "all";

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved)
        setColumnVisibility((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch (e) {
      console.error("Failed to load column settings:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ page, filters, searchTerm, viewMode }),
    );
  }, [page, filters, searchTerm, viewMode]);

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    if (!showColumnSettings) return;
    const handler = (e: MouseEvent) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(e.target as Node)
      ) {
        setShowColumnSettings(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColumnSettings]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, dmoId, authorityId]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      dmoId,
      authorityId,
      limit: LIMIT,
      locale: language,
      externalApiId: websiteId,
    };
    const finalSearch = localStorage.getItem(SEARCH_STORAGE_KEY) ?? searchTerm;
    if (finalSearch) params.search = finalSearch;
    if (filters.status !== "all") params.status = filters.status;
    return params;
  }, [page, searchTerm, filters, language, dmoId, authorityId, websiteId]);

  const { data: poiStatsData, isLoading: isStatsLoading } = useGetPoiStatsQuery(
    {},
  );
  const {
    data: poiData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllPOIQuery(queryParams);
  const [bulkPoisUpdate, { isLoading: isDeleting }] =
    useBulkPoisUpdateMutation();

  const hasMore = poiData?.meta?.hasNextPage;
  const totalData = poiData?.totalData;

  useEffect(() => {
    if (!poiData?.data?.length) {
      setCombinedPois([]);
      return;
    }
    setCombinedPois((prev) => {
      if (page === 1) return poiData?.data;
      const existingIds = new Set(prev.map((p) => p._id));
      const newItems = poiData?.data?.filter(
        (p: any) => !existingIds.has(p._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [poiData, page]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  const handlePoiClick = useCallback(
    (poi: any) => {
      navigate(`${routes.poiDetails}?poiId=${poi?._id}`, { replace: true });
    },
    [navigate],
  );

  const clearFilter = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEARCH_STORAGE_KEY);
    setFilters({ status: "all" });
    setSearchTerm("");
    setPage(1);
  }, []);

  const promptBulkDelete = useCallback(() => {
    if (!selectedPois.size) return;
    setIsBulkDelete(true);
    setIsConfirmOpen(true);
  }, [selectedPois.size]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedPois.size) return;
    const toastId = toast.loading(tc("poi_delete_loading"));
    try {
      const results = await bulkPoisUpdate({
        poiIds: Array.from(selectedPois),
        isDeleted: true,
      });
      if (results?.data) {
        toast.success(tc("poi_deleted_success"), { id: toastId });
        setSelectedPois(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || tc("poi_delete_failed"), { id: toastId });
    } finally {
      setIsConfirmOpen(false);
      setIsBulkDelete(false);
    }
  }, [selectedPois, bulkPoisUpdate, refetch, tc]);

  const handleBulkStatusChange = useCallback(
    async (status: TStatus) => {
      if (!selectedPois.size) return;
      const toastId = toast.loading(tc("poi_status_change_loading"));
      try {
        const results = await bulkPoisUpdate({
          poiIds: Array.from(selectedPois),
          status: status?.toLocaleUpperCase(),
        });
        if (results?.data) {
          toast.success(tc("poi_status_update_success"), { id: toastId });
          setSelectedPois(new Set());
          refetch();
        }
      } catch (error: any) {
        toast.error(error?.message || tc("poi_status_update_failed"), {
          id: toastId,
        });
      }
    },
    [selectedPois, bulkPoisUpdate, refetch, tc],
  );

  const poiStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total_pois"),
        value: poiStatsData?.totalPOIs,
        label: t("registered"),
        icon: <MapPin className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 2,
        title: t("active_pois"),
        value: poiStatsData?.activePOIs,
        label: t("approved"),
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      },
      {
        id: 3,
        title: t("pending_approval"),
        value: poiStatsData?.pendingApproval,
        label: t("awaiting"),
        icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      },
      {
        id: 4,
        title: t("avg_completion"),
        value: poiStatsData?.averageCompletion,
        label: t("profile_data"),
        icon: <Landmark className="w-5 h-5 text-teal-600" />,
      },
    ],
    [poiStatsData, t],
  );

  return (
    <>
      <div className="flex flex-col pt-10 md:pt-0">
        <div
          className={`border-b ${isDark ? "border-gray-800" : "bg-transparent border-gray-200"} z-10`}
        >
          <PageHeader
            title={t("poi_management")}
            description={t("poi_management_desc")}
            btnLabel={t("add_poi")}
            onClick={() => setIsCreateModalOpen(true)}
            h1Gradient="bg-linear-to-r text-transparent from-teal-500 via-green-500 to-emerald-600"
            totalCount={totalData ?? 0}
          />
          <PageStats
            stats={poiStats}
            isLoading={isStatsLoading}
            className="sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4"
          />

          <div className="py-3 flex flex-col gap-2">
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_pois_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>

            <div className="flex items-center justify-between gap-2 ">
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
                  resetToDefault={() => setColumnVisibility(defaultColumns)}
                />

                <ExportPoiButton
                  pois={combinedPois}
                  selectedPois={selectedPois}
                  columnVisibility={columnVisibility}
                  t={t}
                />
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
                tableName="poiViewMode"
              />
            </div>
          </div>

          {(showFilters || hasSavedFilters) && (
            <div
              className={`border-t py-2 ${isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex flex-wrap items-start gap-4 ml-4 w-full">
                <FilterByStatus filters={filters} setFilters={setFilters} />
                {hasSavedFilters && (
                  <div className="flex flex-col min-w-45">
                    <label
                      className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {t("active_filters")}
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(
                          ([key, value]) =>
                            value !== "all" && (
                              <FilterChips
                                key={key}
                                label={t(value.toLowerCase())}
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
                        className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
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
            selectedItemCount={selectedPois.size}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
            hancleClearSelection={() => setSelectedPois(new Set())}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-2">
          {!isLoading && !isFetching && combinedPois.length === 0 ? (
            <div
              className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
            >
              <EmptyState searchQuery={searchTerm} />
            </div>
          ) : viewMode === "list" ? (
            <PoiListView
              t={t}
              hasMore={!!hasMore}
              next={fetchNextPage}
              isLoading={isLoading}
              columnVisibility={columnVisibility}
              pois={combinedPois}
              onPoiClick={handlePoiClick}
              selectedPois={selectedPois}
              setSelectedPois={setSelectedPois}
            />
          ) : (
            <PoiGridView
              refetch={refetch}
              hasMore={!!hasMore}
              next={fetchNextPage}
              data={combinedPois}
              onRowClick={handlePoiClick}
              isLoading={isLoading || isFetching}
              selectedItems={selectedPois}
              setSelectedItems={setSelectedPois}
            />
          )}
        </div>

        <ConfirmDialog
          open={isConfirmOpen}
          title={t("delete_poi")}
          message={t("delete_poi_confirm")}
          confirmText="delete"
          loading={isDeleting}
          variant="danger"
          onCancel={() => {
            setIsConfirmOpen(false);
            setIsBulkDelete(false);
          }}
          onConfirm={() => {
            if (isBulkDelete) handleBulkDelete();
            setIsConfirmOpen(false);
          }}
        />

        {isCreateModalOpen && (
          <CreatePoiWizard
            onClose={() => setIsCreateModalOpen(false)}
            refetch={refetch}
          />
        )}
      </div>
    </>
  );
}
