import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReordableDataTable } from "@/components/shared";
import { getPlainTextFromRichText } from "@/helpers";
import { StatusPill, ScorePill } from "@/components/pills";

export const defaultColumns = {
  impact: true,
  name: true,
  shortDescription: true,
  address: true,
  status: true,
};

export type ColumnVisibility = typeof defaultColumns;

interface PoiListViewProps {
  pois: any[];
  isLoading: boolean;
  onPoiClick: (poi: any) => void;
  next: () => void;
  hasMore: boolean;
  columnVisibility: ColumnVisibility;
  t: (key: string) => string;
  selectedPois: Set<string>;
  setSelectedPois: (v: Set<string>) => void;
}

export default function PoiListView({
  t,
  isLoading,
  pois,
  onPoiClick,
  next,
  hasMore,
  columnVisibility,
  selectedPois,
  setSelectedPois,
}: PoiListViewProps) {
  const { textPrimary, isDark } = useThemeClasses();
  const [error] = useState(false);

  const columns = [
    { key: "checkbox", label: "", width: "50px" },

    columnVisibility.name && {
      key: "name",
      sortable: true,
      label: t("poi_name"),
      render: (poi: any) => (
        <span className={`${textPrimary} line-clamp-1`}>
          {poi.name || poi.slug || "-"}
        </span>
      ),
    },

    columnVisibility.shortDescription && {
      key: "shortDescription",
      sortable: true,
      label: t("short_description"),
      render: (poi: any) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {getPlainTextFromRichText(poi?.shortDescription)}
        </div>
      ),
    },

    columnVisibility.address && {
      key: "address",
      sortable: false,
      label: t("address"),
      render: (poi: any) => (
        <span className={`${textPrimary} line-clamp-1`}>
          {poi?.address?.location || poi?.address?.city || "-"}
        </span>
      ),
    },

    columnVisibility.status && {
      key: "status",
      label: t("status"),
      sortable: true,
      render: (poi: any) => <StatusPill status={poi.status} />,
    },

    columnVisibility.impact && {
      key: "impact",
      sortable: true,
      label: t("impact"),
      width: "110px",
      render: (poi: any) => <ScorePill score={poi.impact ?? 0} />,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3
            className={`text-xl mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {t("error_loading_pois")}
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="sticky">
        <ReordableDataTable
          rowKey="_id"
          data={pois}
          isDataLoading={isLoading}
          selectedItems={selectedPois}
          onSelectionChange={setSelectedPois}
          onRowClick={(poi) => onPoiClick(poi)}
          storageKey="poisTableColumnOrder"
          columns={columns}
          hasMore={hasMore}
          next={next}
          t={t}
        />
      </div>
    
  );
}
