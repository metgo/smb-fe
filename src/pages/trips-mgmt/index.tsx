import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FilterButton } from "@/components/btns";
import {
  BulkActionBar,
  ConfirmDialog,
  PageHeader,
  ShowColumns,
} from "@/components/shared";
import SearchInput from "@/components/shared/SearchInput";
import EmptyState from "@/components/shared/EmptyState";
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
  const { isDark, bgSecondary, borderColor } = useThemeClasses();
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

  return (
    <div className="flex flex-col pt-10 md:pt-0">
      <div
        className={`border-b ${isDark ? "border-gray-800" : "bg-transparent border-gray-200"} z-10`}
      >
        <PageHeader
          title={t("trips_management")}
          description={t("trips_management_desc")}
          btnLabel={t("add_trip")}
          onClick={() => setIsCreateModalOpen(true)}
          h1Gradient="bg-linear-to-r text-transparent from-teal-500 via-green-500 to-emerald-600"
          totalCount={combinedTrips.length}
        />

        <div className="py-3 flex flex-col gap-2">
          <div className="flex-1 relative">
            <SearchInput
              placeholder={t("search_trips_placeholder")}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
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
        </div>

        {(showFilters || hasSavedFilters) && (
          <TripsFiltersPanel
            filters={filters}
            setFilters={setFilters}
            hasSavedFilters={hasSavedFilters}
            clearFilter={clearFilter}
          />
        )}

        <BulkActionBar
          selectedItemCount={selectedTrips.size}
          handleBulkStatusChange={handleBulkStatusChange}
          handleBulkDelete={promptBulkDelete}
          hancleClearSelection={() => setSelectedTrips(new Set())}
        />
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        {!isLoading && !isFetching && combinedTrips.length === 0 ? (
          <div
            className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
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
    </div>
  );
};

export default TripsMgmtPage;
