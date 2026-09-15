import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReordableDataTable } from "@/components/shared";
import { getStatusColor } from "../mini-site.utils";

export const defaultColumns = {
  code: true,
  name: true,
  companyName: true,
  website: true,
  status: true,
  voucherAmount: true,
  totalVouchers: true,
  usedVouchers: true,
  revenue: true,
};

export type MiniSiteColumnVisibility = typeof defaultColumns;

interface MiniSiteListViewProps {
  miniSites: ICampaign[];
  columnVisibility: MiniSiteColumnVisibility;
  selectedRows: Set<string>;
  setSelectedRows: (v: Set<string>) => void;
  onRowClick: (site: ICampaign) => void;
  t: (key: string) => string;
  hasMore?: any;
  next?: any;
  isLoading?: any;
}

export default function MiniSiteListView({
  miniSites,
  columnVisibility,
  selectedRows,
  setSelectedRows,
  onRowClick,
  t,
  isLoading,
}: MiniSiteListViewProps) {
  const { textPrimary, textSecondary, isDark } = useThemeClasses();

  const columns = [
    ...[{ key: "checkbox", label: "", width: "50px" }],

    columnVisibility.code && {
      key: "code",
      label: t("campaign_code"),
      width: "120px",
      render: (site: ICampaign) => (
        <span className={`${textPrimary} font-mono text-sm`}>{site?.code}</span>
      ),
    },

    columnVisibility.name && {
      key: "name",
      label: t("campaign_name"),
      render: (site: ICampaign) => (
        <span className={textPrimary}>{site?.name}</span>
      ),
    },

    columnVisibility.companyName && {
      key: "companyInfo",
      label: t("company_name"),
      render: (site: ICampaign) => (
        <span className={textSecondary}>{site?.companyInfo?.name}</span>
      ),
    },

    columnVisibility.website && {
      key: "website",
      label: t("website"),
      render: (site: ICampaign) => (
        <a
          href={site?.externalApiId}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-teal-500 hover:text-teal-600"
        >
          {site?.externalApiId}
        </a>
      ),
    },

    columnVisibility.status && {
      key: "status",
      label: t("status"),
      render: (site: ICampaign) => (
        <span
          className={clsx(
            "inline-block px-2 py-1 rounded-full text-xs border",
            getStatusColor(site?.status, isDark),
          )}
        >
          {site?.status}
        </span>
      ),
    },

    columnVisibility.voucherAmount && {
      key: "voucherAmount",
      label: t("voucher_amount"),
      render: (site: ICampaign) => <>₪{site?.miniSite.amount}</>,
    },

    columnVisibility.totalVouchers && {
      key: "totalVouchers",
      label: t("total_vouchers"),
      render: (site: ICampaign) => <>{site?.miniSite.amount}</>,
    },

    // columnVisibility.usedVouchers && {
    //   key: "usedVouchers",
    //   label: t("used_vouchers"),
    //   render: (site: ICampaign) => {
    //     const percentage =
    //       site?.totalVouchers > 0
    //         ? (site?.usedVouchers / site?.totalVouchers) * 100
    //         : 0;
    //     return (
    //       <>
    //         {site?.usedVouchers}{" "}
    //         <span className={`ml-2 text-xs ${textTertiary}`}>
    //           ({percentage.toFixed(0)}%)
    //         </span>
    //       </>
    //     );
    //   },
    // },

    // columnVisibility.revenue && {
    //   key: "revenue",
    //   label: t("revenue"),
    //   render: (site: ICampaign) => <>₪{site?.revenue?.toLocaleString()}</>,
    // },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    render?: (row: ICampaign) => React.ReactNode;
  }[];

  return (
    <div className="flex flex-col overflow-hidden h-[calc(100vh-300px)]">
      <ReordableDataTable
        rowKey="_id"
        data={miniSites}
        isDataLoading={isLoading}
        selectedItems={selectedRows}
        onSelectionChange={setSelectedRows}
        onRowClick={onRowClick}
        storageKey="miniSitesTableColumnOrder"
        columns={columns}
        hasMore={false}
        next={() => {}}
        t={t}
      />
    </div>
  );
}
