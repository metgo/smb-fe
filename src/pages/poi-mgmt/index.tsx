import { toast } from "sonner";
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
import {
  BulkActionBar,
  ConfirmDialog,
  PageHeader,
  PageStats,
  ShowColumns,
  ViewModeToggle,
} from "@/components/shared";
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
  const { isDark, bgSecondary, borderColor } = useThemeClasses();

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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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
      <div className="flex flex-col pt-10 md:pt-0">
        {/* Sticky Header */}
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

          {/* Search & Actions */}
          <div className="py-3 flex flex-col gap-2">
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_pois_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
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

          {/* Filters Panel */}
          {(showFilters || hasSavedFilters) && (
            <PoiFiltersPanel
              filters={filters}
              setFilters={setFilters}
              hasSavedFilters={hasSavedFilters}
              clearFilter={clearFilter}
            />
          )}

          <BulkActionBar
            selectedItemCount={selectedPois.size}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
            hancleClearSelection={() => setSelectedPois(new Set())}
          />
        </div>

        {/* Content Area */}
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
      </div>
    </>
  );
}
