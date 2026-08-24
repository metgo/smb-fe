import clsx from "clsx";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FilterButton } from "@/components/btns";
import {
  BulkActionBar,
  ConfirmDialog,
  ShowColumns,
} from "@/components/shared";
import SearchInput from "@/components/shared/SearchInput";
import EmptyState from "@/components/shared/EmptyState";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import {
  useDeleteTripMutation,
  useBulkDeleteTripsMutation,
  useBulkUpdateTripsStatusMutation,
} from "@/store/api/tripsMutationApi";

import {
  CreateTripWizard,
  TripsFiltersPanel,
  TripsListView,
} from "./components";
import { useTripListFilters } from "./hooks/useTripListFilters";
import { useTripListData } from "./hooks/useTripListData";
import { TRIP_COLUMNS } from "@/lib/utils";

const { defaultColumns, columnDefinitions, COLUMNS_STORAGE_KEY } = TRIP_COLUMNS;

const TripsMgmtPage = () => {
  const { t } = useTranslation("trips");
  const { t: tc } = useTranslation("common");
  const { isDark, bgSecondary, borderColor } =
    useThemeClasses();
  const [_searchParams, setSearchParams] = useSearchParams();

  const {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilter,
    hasSavedFilters,
  } = useTripListFilters();

  const {
    combinedTrips,
    isLoading,
    isFetching,
    hasMore,
    fetchNextPage,
    refetchFromPage1,
  } = useTripListData(filters, searchTerm);

  const [showFilters, setShowFilters] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] =
    useState<ITripColumnVisibility>(defaultColumns);
  const [tripToDelete, setTripToDelete] = useState<ITrip | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const [deleteTrip, { isLoading: isDeleting }] = useDeleteTripMutation();
  const [bulkDeleteTrips, { isLoading: isBulkDeleting }] =
    useBulkDeleteTripsMutation();
  const [bulkUpdateTripsStatus] = useBulkUpdateTripsStatusMutation();

  const columnSettingsRef = useRef<HTMLDivElement>(null);

  // Active filter count for badge on toggle button
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm?.trim()) count += 1;
    // Count non-default filter values if your filters object supports it
    // Adjust based on actual filter shape from useTripListFilters
    if (hasSavedFilters) count += 1;
    return count;
  }, [searchTerm, hasSavedFilters]);

  // Collapse controls drawer on scroll (same as Events)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        (target && target.scrollTop && target.scrollTop > 20) ||
        window.scrollY > 20
      ) {
        setShowControlsDrawer(false);
      }
    };
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", handleScroll, {
        capture: true,
      } as any);
  }, []);

  const handleEdit = (trip: ITrip) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("id", trip._id);
      return next;
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("id");
      return next;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    try {
      await deleteTrip({ tripId: tripToDelete._id }).unwrap();
      toast.success(tc("delete_success"));
      refetchFromPage1();
    } catch (err: any) {
      toast.error(err?.data?.message?.[0] || tc("delete_failed"));
    } finally {
      setTripToDelete(null);
    }
  };

  const promptBulkDelete = () => {
    if (!selectedTrips.size) return;
    setIsBulkDeleteConfirmOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!selectedTrips.size) return;
    const toastId = toast.loading(tc("trip_delete_loading"));
    try {
      await bulkDeleteTrips({ ids: Array.from(selectedTrips) }).unwrap();
      toast.success(tc("trip_deleted_success"), { id: toastId });
      setSelectedTrips(new Set());
      refetchFromPage1();
    } catch (err: any) {
      toast.error(err?.data?.message?.[0] || tc("trip_delete_failed"), {
        id: toastId,
      });
    } finally {
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  const handleBulkStatusChange = async (status: TStatus) => {
    if (!selectedTrips.size) return;
    const toastId = toast.loading(tc("trip_status_change_loading"));
    try {
      await bulkUpdateTripsStatus({
        ids: Array.from(selectedTrips),
        status: status.toUpperCase(),
      }).unwrap();
      toast.success(tc("trip_status_update_success"), { id: toastId });
      setSelectedTrips(new Set());
      refetchFromPage1();
    } catch (err: any) {
      toast.error(err?.data?.message?.[0] || tc("trip_status_update_failed"), {
        id: toastId,
      });
    }
  };

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

  const resetToDefault = useCallback(() => {
    setColumnVisibility(TRIP_COLUMNS.defaultColumns);
  }, []);

  // Reusable filter toggle button (same style as Events)
  const filterToggleButton = (
    <button
      onClick={() => setShowControlsDrawer((prev) => !prev)}
      className={clsx(
        "relative p-2 rounded-xl border transition-all cursor-pointer shrink-0",
        showControlsDrawer
          ? "bg-teal-600 text-white border-teal-500 shadow-teal-500/20"
          : isDark
            ? "bg-gray-900 border-gray-800 text-teal-400 hover:bg-gray-800 hover:border-teal-500/40"
            : "bg-gray-100 border-gray-200 text-teal-700 hover:bg-gray-200 hover:border-teal-400",
      )}
      title={
        showControlsDrawer
          ? tc("close_options") ?? "Close Options"
          : tc("search_and_filters") ?? "Search & Filters"
      }
    >
      <SlidersHorizontal className="w-4 h-4" />
      {activeFilterCount > 0 && (
        <span
          className={clsx(
            "absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none",
            showControlsDrawer
              ? "bg-white text-teal-600"
              : "bg-teal-500 text-white",
          )}
        >
          {activeFilterCount > 9 ? "9+" : activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        {/* Sticky Top Header Bar — same design as Events */}
        <div
          className={clsx(
            "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
            isDark
              ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          )}
        >
          <ListHeaderBar
            title={t("trips_management")}
            titleGradient="from-teal-500 via-green-500 to-emerald-600"
            count={combinedTrips.length}
            addLabel={t("add_trip")}
            onAdd={() => setIsCreateModalOpen(true)}
            filterToggle={filterToggleButton}
          />
        </div>

        {/* Expandable Search, Filters & Controls Panel */}
        {showControlsDrawer && (
          <div
            className={clsx(
              "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2",
              isDark
                ? "bg-gray-900/90 border-gray-800/90"
                : "bg-white border-gray-200",
            )}
          >
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_trips_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div className="flex items-center justify-between gap-2 w-full flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton value={showFilters} onChange={setShowFilters} />
                <ShowColumns
                  t={t}
                  columnDefinitions={columnDefinitions}
                  columnVisibility={columnVisibility}
                  showColumnSettings={showColumnSettings}
                  setShowColumnSettings={setShowColumnSettings}
                  setColumnVisibility={setColumnVisibility}
                  resetToDefault={resetToDefault}
                />
              </div>
            </div>

            {(showFilters || hasSavedFilters) && (
              <TripsFiltersPanel
                filters={filters}
                setFilters={setFilters}
                hasSavedFilters={hasSavedFilters}
                clearFilter={clearFilter}
              />
            )}
          </div>
        )}

        {/* Bulk Action Bar (when items selected) */}
        {selectedTrips.size > 0 && (
          <BulkActionBar
            selectedItemCount={selectedTrips.size}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
            hancleClearSelection={() => setSelectedTrips(new Set())}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!isLoading && !isFetching && combinedTrips.length === 0 ? (
            <div
              className={clsx(
                "text-center py-16 rounded-2xl border",
                bgSecondary,
                borderColor,
              )}
            >
              <EmptyState searchQuery={searchTerm} />
            </div>
          ) : (
            <TripsListView
              t={t}
              hasMore={hasMore}
              next={fetchNextPage}
              isLoading={isLoading || isFetching}
              trips={combinedTrips}
              columnVisibility={columnVisibility}
              selectedTrips={selectedTrips}
              setSelectedTrips={setSelectedTrips}
              onEdit={handleEdit}
              onDelete={setTripToDelete}
            />
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateTripWizard
          onClose={handleCloseModal}
          onPublishSuccess={refetchFromPage1}
        />
      )}

      <ConfirmDialog
        open={!!tripToDelete}
        title="delete_trip"
        message="delete_trip_confirm"
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => setTripToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        title="delete_trip"
        message="delete_trip_confirm"
        confirmText="delete"
        loading={isBulkDeleting}
        variant="danger"
        onCancel={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
      />
    </>
  );
};

export default TripsMgmtPage;