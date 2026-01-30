import clsx from "clsx";
import { AlertCircle, ExternalLink } from "lucide-react";
import { useState } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReordableDataTable } from "@/components/shared";
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
  theme: Theme;
  businesses: any[];
  isLoading: boolean;
  onBusinessClick: (business: any) => void;
  next: () => void;
  hasMore: boolean;
  columnVisibility: ColumnVisibility;
  t: (key: string) => string;
}

const USER_ROLE = "admin";

export default function BusinessListView({
  theme,
  isLoading,
  businesses,
  onBusinessClick,
  next,
  hasMore,
  columnVisibility,
  t,
}: BusinessListViewProps) {
  const { textPrimary, textSecondary } = useThemeClasses();

  const [error, _setError] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(
    new Set(),
  );

  // Permission check
  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );

  const columns = [
    ...(canChangeStatus ? [{ key: "checkbox", label: "", width: "50px" }] : []),

    columnVisibility.impact && {
      key: "impact",
      label: t("impact_score"),
      width: "110px",
      render: (business: any) => {
        const score = business.impact ?? 0;
        return (
          <span
            className={clsx(
              "inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-medium",
              score >= 650
                ? theme === "dark"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-green-100 text-green-700"
                : score >= 450
                  ? theme === "dark"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                  : theme === "dark"
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-600",
            )}
          >
            {score}
          </span>
        );
      },
    },

    columnVisibility.name && {
      key: "name",
      label: t("business_name"),
      render: (business: any) => (
        <span className={`${textPrimary} line-clamp-1`}>
          {business.name || business.slug || t("unnamed_business") || "-"}
        </span>
      ),
    },

    columnVisibility.shortDescription && {
      key: "shortDescription",
      label: t("shortDescription"),
      render: (business: any) => (
        <span className={`${textPrimary} line-clamp-1`}>
          {business.shortDescription || "-"}
        </span>
      ),
    },

    columnVisibility.contactDetails && {
      key: "contactDetails",
      label: t("contactPerson"),
      render: (business: any) => (
        <span className={textPrimary}>
          {business.contactDetails?.name || "-"}
        </span>
      ),
    },

    columnVisibility.busiEmail && {
      key: "busiEmail",
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
      label: t("products_count"),
      render: (business: any) => (
        <span className={textPrimary}>{business.productCount ?? 0}</span>
      ),
    },

    columnVisibility.status && {
      key: "status",
      label: t("status"),
      render: (business: any) => {
        const st = (business.status || "").toLowerCase();
        return (
          <span
            className={clsx(
              "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium",
              st === "approved"
                ? "bg-blue-500/20 text-blue-400"
                : st === "pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : st === "rejected"
                    ? "bg-red-500/20 text-red-400"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-100 text-gray-600",
            )}
          >
            {t(st) || st || t("unknown")}
          </span>
        );
      },
    },

    columnVisibility.tripCount && {
      key: "tripCount",
      label: t("trips"),
      render: (business: any) => (
        <span className={textPrimary}>{business.tripCount ?? 0}</span>
      ),
    },

    columnVisibility.associatedWebsites && {
      key: "associatedWebsites",
      label: t("website"),
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
            className={`text-xl mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
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
    <div className="flex flex-col overflow-hidden h-[calc(108vh-210px)] ">
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
