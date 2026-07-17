import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FilterButton } from "@/components/btns";
import { ConfirmDialog, PageHeader, ShowColumns } from "@/components/shared";
import SearchInput from "@/components/shared/SearchInput";
import EmptyState from "@/components/shared/EmptyState";
import { useDeleteTripMutation } from "@/store/api/tripsMutationApi";

import {
  CreateTripWizard,
  TripsFiltersPanel,
  TripsListView,
} from "./components";
import { useTripListFilters } from "./hooks/useTripListFilters";
import { useTripListData } from "./hooks/useTripListData";

const COLUMNS_STORAGE_KEY = "tripsTableColumns";

type ColumnVisibility = {
  name: boolean;
  shortDescription: boolean;
  estimatedDuration: boolean;
  stations: boolean;
  status: boolean;
  createdAt: boolean;
};

const defaultColumns: ColumnVisibility = {
  name: true,
  shortDescription: true,
  estimatedDuration: true,
  stations: true,
  status: true,
  createdAt: true,
};

const columnDefinitions: Array<{
  key: keyof ColumnVisibility;
  isDefault: boolean;
}> = [
  { key: "name", isDefault: true },
  { key: "shortDescription", isDefault: true },
  { key: "estimatedDuration", isDefault: true },
  { key: "stations", isDefault: true },
  { key: "status", isDefault: true },
  { key: "createdAt", isDefault: true },
];

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
    useState<ColumnVisibility>(defaultColumns);
  const [tripToDelete, setTripToDelete] = useState<ITrip | null>(null);

  const [deleteTrip, { isLoading: isDeleting }] = useDeleteTripMutation();

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
    setColumnVisibility(defaultColumns);
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
    </div>
  );
};

export default TripsMgmtPage;
