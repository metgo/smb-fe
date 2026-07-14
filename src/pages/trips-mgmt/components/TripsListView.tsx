import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReordableDataTable } from "@/components/shared";
import { StatusPill } from "@/components/pills";

export type TripColumnVisibility = {
  name: boolean;
  shortDescription: boolean;
  estimatedDuration: boolean;
  stations: boolean;
  status: boolean;
  createdAt: boolean;
};

interface TripsListViewProps {
  trips: ITrip[];
  isLoading: boolean;
  next: () => void;
  hasMore: boolean;
  t: (key: string) => string;
  columnVisibility: TripColumnVisibility;
  selectedTrips: Set<string>;
  setSelectedTrips: (v: Set<string>) => void;
}

export default function TripsListView({
  t,
  isLoading,
  trips,
  next,
  hasMore,
  columnVisibility,
  selectedTrips,
  setSelectedTrips,
}: TripsListViewProps) {
  const { textPrimary } = useThemeClasses();

  const columns = [
    { key: "checkbox", label: "", width: "50px" },

    columnVisibility.name && {
      key: "name",
      sortable: true,
      label: t("trip_name"),
      render: (trip: ITrip) => (
        <span className={`${textPrimary} line-clamp-1`}>{trip.name}</span>
      ),
    },

    columnVisibility.shortDescription && {
      key: "shortDescription",
      sortable: true,
      label: t("short_description"),
      render: (trip: ITrip) => (
        <span className={`${textPrimary} line-clamp-1`}>
          {trip.shortDescription || "-"}
        </span>
      ),
    },

    columnVisibility.estimatedDuration && {
      key: "estimatedDuration",
      sortable: true,
      label: t("estimated_duration"),
      width: "150px",
      render: (trip: ITrip) => (
        <span className={textPrimary}>{trip.estimatedDuration ?? "-"}</span>
      ),
    },

    columnVisibility.stations && {
      key: "stations",
      sortable: true,
      label: t("stations"),
      width: "110px",
      render: (trip: ITrip) => (
        <span className={textPrimary}>{trip.stations ?? "-"}</span>
      ),
    },

    columnVisibility.status && {
      key: "status",
      sortable: true,
      label: t("status"),
      render: (trip: ITrip) => <StatusPill status={trip.status} />,
    },

    columnVisibility.createdAt && {
      key: "createdAt",
      sortable: true,
      label: t("created_at"),
      render: (trip: ITrip) => (
        <span className={textPrimary}>
          {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: ITrip) => React.ReactNode;
  }[];

  return (
    <div className="flex flex-col overflow-hidden h-[calc(100vh-400px)]">
      <div className="sticky">
        <ReordableDataTable
          rowKey="_id"
          data={trips}
          isDataLoading={isLoading}
          selectedItems={selectedTrips}
          onSelectionChange={setSelectedTrips}
          storageKey="tripsTableColumnOrder"
          columns={columns}
          hasMore={hasMore}
          next={next}
          t={t}
        />
      </div>
    </div>
  );
}
