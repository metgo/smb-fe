import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Target,
  Download,
  Copy,
  CheckSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  MinisiteCreateWizard,
  MinisiteGridView,
  MinisiteListView,
} from "./components";
import { useGetAllMiniSitesQuery } from "@/store/api/miniSiteQueryApi";
import { useNavigate } from "react-router-dom";
import { routes } from "@/lib/routes";
import { ViewModeToggle } from "@/components/shared";
import SearchInput from "@/components/shared/SearchInput";

interface MiniSite {
  id: string;
  code: string;
  name: string;
  companyName: string;
  website: string;
  startDate: string;
  endDate: string;
  status: "active" | "draft" | "completed" | "paused";
  voucherAmount: number;
  totalVouchers: number;
  usedVouchers: number;
  revenue: number;
  conversionRate: number;
}
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
type ColumnVisibility = typeof defaultColumns;

export default function MiniSiteMgmtPage() {
  const { t } = useTranslation("minisites");

  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
  } = useThemeClasses();

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [editingMiniSite, setEditingMiniSite] = useState<MiniSite | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  //api call
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState<number>(1);
  const [selectedMiniSites, setSelectedMiniSites] = useState<Set<string>>(
    new Set(),
  );
  const LIMIT = 20;
  const [filters, setFilters] = useState({
    status: "all",
  });
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit: LIMIT,
    };

    if (searchTerm) params.search = searchTerm;

    if (filters.status !== "all") {
      params.status = filters.status;
    }

    return params;
  }, [page, searchTerm, filters]);
  const {
    data: miniSiteData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllMiniSitesQuery(queryParams);

  const hasMore = miniSiteData?.meta?.hasNextPage;
  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev: number) => {
      return prev + 1;
    });
  };
  const [columnVisibility, _setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);

  const navigate = useNavigate();
  const handleMiniSiteClick = (miniSite: any) => {
    console.log("🚀 ~ handleMiniSiteClick ~ miniSite:", miniSite);
    navigate(`${routes.miniSiteDetails}?miniSiteId=${miniSite?._id}`, {
      replace: true,
    });
  };

  // Calculate KPIs
  const totalCampaigns = miniSiteData?.data.length;
  const activeCampaigns = miniSiteData?.data.filter(
    (s: any) => s.status === "active",
  ).length;
  const totalRevenue = miniSiteData?.data.reduce(
    (sum: any, s: any) => sum + s.revenue,
    0,
  );
  const totalVouchers = miniSiteData?.data.reduce(
    (sum: any, s: any) => sum + s.totalVouchers,
    0,
  );
  const usedVouchers = miniSiteData?.data.reduce(
    (sum: any, s: any) => sum + s.usedVouchers,
    0,
  );
  const avgConversion =
    miniSiteData?.data.reduce((sum: any, s: any) => sum + s.conversionRate, 0) /
    miniSiteData?.data.length;

  const exportToCSV = () => {
    if (selectedRows.size === 0) return;

    const selectedSites = miniSiteData?.data?.filter((site: any) =>
      selectedRows.has(site.id),
    );
    const headers = [
      "Campaign Code",
      "Campaign Name",
      "Company Name",
      "Website",
      "Status",
      "Voucher Amount",
      "Total Vouchers",
      "Used Vouchers",
      "Revenue",
      "Start Date",
      "End Date",
    ];
    const csvContent = [
      headers.join(","),
      ...selectedSites.map((site: any) =>
        [
          site.campaignCode,
          `"${site.campaignName}"`,
          `"${site.companyName}"`,
          site.website,
          site.status,
          site.voucherAmount,
          site.totalVouchers,
          site.usedVouchers,
          site.revenue,
          site.startDate,
          site.endDate,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mini-sites-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    setSelectedRows(new Set());
  };

  const exportToXLS = () => {
    if (selectedRows.size === 0) return;

    const selectedSites = miniSiteData?.data.filter((site: any) =>
      selectedRows.has(site.id),
    );
    const headers = [
      "Campaign Code",
      "Campaign Name",
      "Company Name",
      "Website",
      "Status",
      "Voucher Amount",
      "Total Vouchers",
      "Used Vouchers",
      "Revenue",
      "Start Date",
      "End Date",
    ];

    // Create HTML table for Excel
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"></head>
        <body>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${selectedSites
                .map(
                  (site: any) => `
                <tr>
                  <td>${site.campaignCode}</td>
                  <td>${site.campaignName}</td>
                  <td>${site.companyName}</td>
                  <td>${site.website}</td>
                  <td>${site.status}</td>
                  <td>${site.voucherAmount}</td>
                  <td>${site.totalVouchers}</td>
                  <td>${site.usedVouchers}</td>
                  <td>${site.revenue}</td>
                  <td>${site.startDate}</td>
                  <td>${site.endDate}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mini-sites-export-${new Date().toISOString().split("T")[0]}.xls`;
    link.click();
    setSelectedRows(new Set());
  };

  return (
    <>
      <main className="overflow-y-auto h-[calc(100vh-64px)] p-6">
        <div>
          {/* Header */}
          <div className="mb-6 flex justify-between">
            <div className="">
              <h1
                className={`text-3xl mb-2 bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}
              >
                {t("mini_site_management_page")}{" "}
                {/* "Mini-Site Management" */}{" "}
              </h1>
              <p className={textSecondary}>
                {t("manage_all_mini_site_campaigns")}
              </p>
            </div>

            <button
              onClick={() => setShowWizard(true)}
              className="ml-2 px-3 py-1 rounded-lg bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all flex items-center gap-1 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t("create_mini_site")}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t("total_mini_sites")}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>{totalCampaigns}</p>
              <p className={`text-xs ${textTertiary}`}>{t("campaigns")}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t("active_mini_sites")}{" "}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>
                {activeCampaigns}
              </p>
              <p className={`text-xs ${textTertiary}`}>{t("campaigns")}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t("total_revenue")}{" "}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>
                ₪{totalRevenue?.toLocaleString()}
              </p>
              <p className={`text-xs ${textTertiary}`}>{t("total")}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-orange-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t("total_vouchers")}{" "}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>{totalVouchers}</p>
              <p className={`text-xs ${textTertiary}`}>{t("total")}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-pink-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t("used_vouchers")}{" "}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>{usedVouchers}</p>
              <p className={`text-xs ${textTertiary}`}>{t("vouchers")}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t("conversion_rate")}{" "}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>
                {avgConversion.toFixed(1)}%
              </p>
              <p className={`text-xs ${textTertiary}`}>{t("rate")}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div
            className={`${bgPrimary} rounded-xl p-4 border ${borderColor} mb-6`}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-1 items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:max-w-md">
                  <SearchInput
                    setSearchTerm={setSearchTerm}
                    searchTerm={searchTerm}
                    isDark={isDark}
                    placeholder={t("search_campaigns")}
                  />
                </div>

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className={`px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="all">{t("all_statuses")}</option>
                  <option value="active">{t("active")}</option>
                  <option value="draft">{t("draft")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="paused">{t("paused")}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ViewModeToggle onChange={setViewMode} value={viewMode} />
              </div>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedRows.size > 0 && (
            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} mb-6 shadow-lg`}
            >
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  <span className={textPrimary}>
                    {selectedRows.size}{" "}
                    {selectedRows.size === 1
                      ? t("item_selected")
                      : t("items_selected")}
                  </span>
                  <button
                    onClick={() => setSelectedRows(new Set())}
                    className={`text-sm ${textTertiary} hover:${textSecondary} underline`}
                  >
                    {t("clear_selection")}{" "}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Change */}
                  <div className="flex items-center gap-2">
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className={`px-3 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      style={{ colorScheme: isDark ? "dark" : "light" }}
                    >
                      <option
                        value=""
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t("change_status")}{" "}
                      </option>
                      <option
                        value="active"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t("active")}{" "}
                      </option>
                      <option
                        value="draft"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t("draft")}{" "}
                      </option>
                      <option
                        value="completed"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t("completed")}{" "}
                      </option>
                      <option
                        value="paused"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t("paused")}{" "}
                      </option>
                    </select>
                    <button
                      // onClick={handleBulkStatusChange}
                      disabled={!bulkStatus}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        bulkStatus
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {t("apply")}{" "}
                    </button>
                  </div>

                  {/* Duplicate - only show when exactly 1 row selected */}
                  {selectedRows.size === 1 && (
                    <button
                      // onClick={handleDuplicate}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      {t("duplicate")}{" "}
                    </button>
                  )}

                  {/* Export Actions */}
                  <button
                    onClick={exportToCSV}
                    className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={exportToXLS}
                    className="px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    XLS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {viewMode === "list" ? (
            <MinisiteListView
              t={t}
              isLoading={isLoading}
              columnVisibility={columnVisibility}
              miniSites={miniSiteData?.data || []}
              selectedRows={selectedMiniSites}
              setSelectedRows={setSelectedMiniSites}
              onRowClick={handleMiniSiteClick}
            />
          ) : (
            <MinisiteGridView
              data={miniSiteData?.data}
              onRowClick={handleMiniSiteClick}
              refetch={refetch}
              next={fetchNextPage}
              hasMore={hasMore}
              isLoading={isLoading}
              t={t}
            />
          )}
        </div>
      </main>

      {/* Wizard Modal */}
      {showWizard && (
        <MinisiteCreateWizard
          onClose={() => {
            setShowWizard(false);
            setEditingMiniSite(null);
          }}
          // onSubmit={handleCreateMiniSite}
          editingMiniSite={editingMiniSite}
        />
      )}
    </>
  );
}
