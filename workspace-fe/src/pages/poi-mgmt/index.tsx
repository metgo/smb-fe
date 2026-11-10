import { toast } from "sonner";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";

import { routes } from "@/lib/routes";
import {
  PoiGridView,
  PoiListView,
  PoiFiltersPanel,
  CreatePoiWizard,
  ExportPoiButton,
} from "./components";

import { CheckCircle, AlertCircle, MapPin, Landmark } from "lucide-react";

import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useViewMode } from "@/hooks/useViewMode";
import {
  BulkActionBar,
  ConfirmDialog,
  ShowColumns,
  ViewModeToggle,
} from "@/components/shared";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import { useBulkPoisUpdateMutation } from "@/store/api/poiMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import EmptyState from "@/components/shared/EmptyState";

import { usePoiFilters } from "./hooks/usePoiFilters";
import { usePoiListData } from "./hooks/usePoiListData";
import { POI_COLUMNS } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const { defaultColumns, columnDefinitions, COLUMNS_STORAGE_KEY } = POI_COLUMNS;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PoiMgmtPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("poi");
  const { t: tc } = useTranslation("toast");
  const { isDark, bgSecondary, borderColor, inputClasses, textTertiary } =
    useThemeClasses();

  // ─── Filter & Search (persisted to localStorage) ─────────────────────
  const {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilter,
    hasSavedFilters,
  } = usePoiFilters();

  // ─── Data fetching & infinite scroll ─────────────────────────────────
  const {
    combinedPois,
    poiStatsData,
    isLoading,
    isFetching,
    isStatsLoading,
    refetchFromPage1,
    hasMore,
    totalData,
    fetchNextPage,
  } = usePoiListData(filters, searchTerm);

  // ─── UI State ─────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [viewMode, setViewMode] = useViewMode("poiViewMode");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedPois, setSelectedPois] = useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] =
    useState<IPoiColumnVisibility>(defaultColumns);

  const columnSettingsRef = useRef<HTMLDivElement>(null);

  // ─── Column visibility (persisted to localStorage) ────────────────────
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

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // ─── Close column dropdown on outside click ────────────────────────────
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

  // ─── Mutations ─────────────────────────────────────────────────────────
  const [bulkPoisUpdate, { isLoading: isDeleting }] =
    useBulkPoisUpdateMutation();

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handlePoiClick = useCallback(
    (poi: any) => {
      navigate(`${routes.poiDetails}?poiId=${poi?._id}`, { replace: true });
    },
    [navigate],
  );

  const resetToDefault = useCallback(() => {
    setColumnVisibility(POI_COLUMNS.defaultColumns);
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
        refetchFromPage1();
      }
    } catch (error: any) {
      toast.error(error?.message || tc("poi_delete_failed"), { id: toastId });
    } finally {
      setIsConfirmOpen(false);
      setIsBulkDelete(false);
    }
  }, [selectedPois, bulkPoisUpdate, refetchFromPage1, tc]);

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
          refetchFromPage1();
        }
      } catch (error: any) {
        toast.error(error?.message || tc("poi_status_update_failed"), {
          id: toastId,
        });
      }
    },
    [selectedPois, bulkPoisUpdate, refetchFromPage1, tc],
  );

  // ─── Stats Cards ───────────────────────────────────────────────────────
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

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        {" "}
        {/* Sticky Top Header Bar (Title + Add Button + Stats) */}
        <div
          className={clsx(
            "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
            isDark
              ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          )}
        >
          <ListHeaderBar
            title={t("poi_management")}
            titleGradient="from-teal-500 via-green-500 to-emerald-600"
            count={totalData}
            addLabel={t("add_poi")}
            onAdd={() => setIsCreateModalOpen(true)}
            stats={poiStats}
            isStatsLoading={isStatsLoading}
          />
        </div>
        {/* Search bar (always visible) + collapsible controls on the same row */}
        <div
          className={clsx(
            "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-0 relative" data-tour="search">
              <SearchInput
                placeholder={t("search_pois_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div className="flex items-center justify-between gap-2 w-full lg:w-auto flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
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
                <ExportPoiButton
                  pois={combinedPois}
                  selectedPois={selectedPois}
                  columnVisibility={columnVisibility}
                  t={t}
                />
              </div>

              <ViewModeToggle
                onChange={setViewMode}
                value={viewMode}
                tableName="poiViewMode"
              />
            </div>
          </div>

          {(showFilters || hasSavedFilters) && (
            <div className={clsx(inputClasses, "px-4 pb-2 rounded-md")}>
              <PoiFiltersPanel
                filters={filters}
                setFilters={setFilters}
                hasSavedFilters={hasSavedFilters}
                clearFilter={clearFilter}
              />
            </div>
          )}

          {/* Active Filters Summary */}
          {(searchTerm || hasSavedFilters) && (
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className={`text-sm ${textTertiary}`}>
                {t("active_filters")}:
              </span>

              {searchTerm && (
                <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-500 rounded-full text-xs">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 text-teal-500 hover:text-teal-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}

              {hasSavedFilters && (
                <button
                  onClick={() => {
                    clearFilter();
                    setSearchTerm("");
                  }}
                  className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                >
                  {t("clear_all")}
                </button>
              )}
            </div>
          )}
        </div>
        <BulkActionBar
          selectedItemCount={selectedPois.size}
          handleBulkStatusChange={handleBulkStatusChange}
          handleBulkDelete={promptBulkDelete}
          hancleClearSelection={() => setSelectedPois(new Set())}
        />
        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
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
              refetch={refetchFromPage1}
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
      </div>

      {/* Modals */}
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
          refetch={refetchFromPage1}
        />
      )}
    </>
  );
}
