import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReordableDataTable } from "@/components/shared";
import { getStatusColor } from "../mini-site.utils";
import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "@/hooks/hooks";
export const defaultColumns = {
  select: true,
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

interface MiniSite {
  _id: string;
  code: true;
  name: true;
  companyInfo: {
    name: string;
    contactPerson: string;
    countryCode: string;
    phoneNumber: string;
    email: string;
  };
  website: string;
  status: string;
  voucherAmount: number;
  totalVouchers: number;
  usedVouchers: number;
  revenue: number;
}

interface MiniSiteListViewProps {
  miniSites: MiniSite[];
  columnVisibility: MiniSiteColumnVisibility;
  selectedRows: Set<string>;
  setSelectedRows: (v: Set<string>) => void;
  onRowClick: (site: MiniSite) => void;
  t: (key: string) => string;
  hasMore?: any;
  next?: any;
  isLoading?: any;
  data?: any;
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
  const { userRole } = useAppSelector((state) => state.auth);
  const canChangeStatus = userRole === UserRole.ADMIN || UserRole.SUPERADMIN;

  const { textPrimary, textSecondary, textTertiary, isDark } =
    useThemeClasses();

  const columns = [
    ...(canChangeStatus ? [{ key: "checkbox", label: "", width: "50px" }] : []),

    columnVisibility.code && {
      key: "code",
      label: t("campaign_code"),
      width: "120px",
      render: (site: MiniSite) => (
        <span className={`${textPrimary} font-mono text-sm`}>{site?.code}</span>
      ),
    },

    columnVisibility.name && {
      key: "name",
      label: t("campaign_name"),
      render: (site: MiniSite) => (
        <span className={textPrimary}>{site?.name}</span>
      ),
    },

    columnVisibility.companyName && {
      key: "companyInfo",
      label: t("company_name"),
      render: (site: MiniSite) => (
        <span className={textSecondary}>{site?.companyInfo?.name}</span>
      ),
    },

    columnVisibility.website && {
      key: "website",
      label: t("website"),
      render: (site: MiniSite) => (
        <a
          href={site?.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-teal-500 hover:text-teal-600"
        >
          {site?.website}
        </a>
      ),
    },

    columnVisibility.status && {
      key: "status",
      label: t("status"),
      render: (site: MiniSite) => (
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
      render: (site: MiniSite) => <>₪{site?.voucherAmount}</>,
    },

    columnVisibility.totalVouchers && {
      key: "totalVouchers",
      label: t("total_vouchers"),
      render: (site: MiniSite) => <>{site?.totalVouchers}</>,
    },

    columnVisibility.usedVouchers && {
      key: "usedVouchers",
      label: t("used_vouchers"),
      render: (site: MiniSite) => {
        const percentage =
          site?.totalVouchers > 0
            ? (site?.usedVouchers / site?.totalVouchers) * 100
            : 0;
        return (
          <>
            {site?.usedVouchers}{" "}
            <span className={`ml-2 text-xs ${textTertiary}`}>
              ({percentage.toFixed(0)}%)
            </span>
          </>
        );
      },
    },

    columnVisibility.revenue && {
      key: "revenue",
      label: t("revenue"),
      render: (site: MiniSite) => <>₪{site?.revenue?.toLocaleString()}</>,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    render?: (row: MiniSite) => React.ReactNode;
  }[];

  return (
    <div className="flex flex-col overflow-hidden h-[calc(100vh-450px)]">
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
