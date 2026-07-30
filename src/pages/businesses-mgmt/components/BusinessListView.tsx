import { AlertCircle, ExternalLink } from "lucide-react";
import { useState } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReordableDataTable } from "@/components/shared";
import { getPlainTextFromRichText } from "@/helpers";
import { StatusPill, ScorePill } from "@/components/pills";

export const defaultColumns = {
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

export type ColumnVisibility = typeof defaultColumns;

interface BusinessListViewProps {
  businesses: any[];
  isLoading: boolean;
  onBusinessClick: (business: any) => void;
  next: () => void;
  hasMore: boolean;
  columnVisibility: ColumnVisibility;
  t: (key: string) => string;
  selectedBusinesses: Set<string>;
  setSelectedBusinesses: (v: Set<string>) => void;
}

export default function BusinessListView({
  t,
  isLoading,
  businesses,
  onBusinessClick,
  next,
  hasMore,
  columnVisibility,
  selectedBusinesses,
  setSelectedBusinesses,
}: BusinessListViewProps) {
  const { textPrimary, textSecondary, isDark } = useThemeClasses();

  const [error, _setError] = useState(false);

  const columns = [
    [{ key: "checkbox", label: "", width: "50px" }],
    columnVisibility.name && {
      key: "name",
      sortable: true,
      label: t("business_name"),
      render: (business: any) => (
        <span className={`${textPrimary} line-clamp-1`}>
          {business.name || business.slug || "-"}
        </span>
      ),
    },

    columnVisibility.shortDescription && {
      key: "shortDescription",
      sortable: true,
      label: t("shortDescription"),
      render: (business: any) => (
        <div className={`${textPrimary} line-clamp-1 max-w-40`}>
          {getPlainTextFromRichText(business?.shortDescription)}
        </div>
      ),
    },

    columnVisibility.contactDetails && {
      key: "contactDetails",
      sortable: true,
      label: t("contactPerson"),
      render: (business: any) => (
        <span className={textPrimary}>
          {business.contactDetails?.name || "-"}
        </span>
      ),
    },

    columnVisibility.busiEmail && {
      key: "busiEmail",
      sortable: true,
      label: t("business_email"),
      render: (business: any) => (
        <a
          href={`mailto:${business.busiEmail}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
        >
          {business.busiEmail || "-"}
        </a>
      ),
    },

    columnVisibility.phoneNumber && {
      key: "phoneNumber",
      sortable: true,
      label: t("phone_number"),
      render: (business: any) => (
        <a
          href={`tel:${business.phoneNumber}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600 whitespace-nowrap"
        >
          {business.phoneNumber || "-"}
        </a>
      ),
    },

    columnVisibility.productCount && {
      key: "productCount",
      sortable: true,
      label: t("products_count"),
      render: (business: any) => (
        <span className={textPrimary}>{business.productCount ?? 0}</span>
      ),
    },

    columnVisibility.status && {
      key: "status",
      label: t("status"),
      sortable: true,
      render: (business: any) => <StatusPill status={business.status} />,
    },

    columnVisibility.tripCount && {
      key: "tripCount",
      sortable: true,
      label: t("trips"),
      render: (business: any) => (
        <span className={textPrimary}>{business.tripCount ?? 0}</span>
      ),
    },
    columnVisibility.impact && {
      key: "impact",
      sortable: true,
      label: t("impact_score"),
      width: "110px",
      render: (business: any) => {
        const score = business.impact ?? 0;
        return <ScorePill score={score} />;
      },
    },
    columnVisibility.associatedWebsites && {
      key: "associatedWebsites",
      label: t("website"),
      sortable: true,
      render: (business: any) => {
        const sites = business.associatedWebsites || [];
        if (!sites.length) return <span className={textSecondary}>-</span>;

        const mainSite = sites.find((s: any) => s.url) || sites[0];
        if (!mainSite?.url) return <span className={textSecondary}>-</span>;

        try {
          const url = new URL(mainSite.url);
          return (
            <a
              href={mainSite.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-teal-500 hover:text-teal-400"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">{url.hostname}</span>
            </a>
          );
        } catch {
          return <span className={textSecondary}>{mainSite.url}</span>;
        }
      },
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center ">
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

  return (
    <div className="flex flex-col overflow-hidden h-[calc(100vh-400px)]">
      <div className="sticky">
        <ReordableDataTable
          rowKey="_id"
          data={businesses}
          isDataLoading={isLoading}
          selectedItems={selectedBusinesses}
          onSelectionChange={setSelectedBusinesses}
          onRowClick={(business) => onBusinessClick(business)}
          storageKey="businessesTableColumnOrder"
          columns={columns}
          hasMore={hasMore}
          next={next}
          t={t}
        />
      </div>
    </div>
  );
}
