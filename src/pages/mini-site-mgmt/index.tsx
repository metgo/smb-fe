import { useState } from "react";
import {
  Search,
  Plus,
  Grid,
  List,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Target,
  Download,
  Copy,
  CheckSquare,
  Square,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  MinisiteCreateWizard,
  MinisiteGridView,
  MinisiteListView,
} from "./components";

interface MiniSite {
  id: string;
  campaignCode: string;
  campaignName: string;
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

export default function MiniSiteMgmtPage() {
  const { t } = useTranslation();

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [editingMiniSite, setEditingMiniSite] = useState<MiniSite | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");

  // Mock data
  const [miniSites, setMiniSites] = useState<MiniSite[]>(
    Array.from({ length: 25 }, (_, i) => ({
      id: `ms-${i + 1}`,
      campaignCode: `CAMP${String(i + 1).padStart(4, "0")}`,
      campaignName: `Campaign ${i + 1}`,
      companyName: `Company ${Math.floor(i / 5) + 1}`,
      website: `Website ${(i % 3) + 1}`,
      startDate: new Date(2024, i % 12, 1).toISOString().split("T")[0],
      endDate: new Date(2024, (i % 12) + 1, 0).toISOString().split("T")[0],
      status: ["active", "draft", "completed", "paused"][i % 4] as any,
      voucherAmount: [50, 100, 150, 200][i % 4],
      totalVouchers: [100, 200, 300, 500][i % 4],
      usedVouchers: Math.floor(Math.random() * 100),
      revenue: Math.floor(Math.random() * 50000),
      conversionRate: Math.floor(Math.random() * 100),
    })),
  );

  const filteredMiniSites = miniSites?.filter((site) => {
    const matchesSearch =
      site.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.campaignCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalCampaigns = miniSites.length;
  const activeCampaigns = miniSites.filter((s) => s.status === "active").length;
  const totalRevenue = miniSites.reduce((sum, s) => sum + s.revenue, 0);
  const totalVouchers = miniSites.reduce((sum, s) => sum + s.totalVouchers, 0);
  const usedVouchers = miniSites.reduce((sum, s) => sum + s.usedVouchers, 0);
  const avgConversion =
    miniSites.reduce((sum, s) => sum + s.conversionRate, 0) / miniSites.length;

  const handleCreateMiniSite = (data: any, status: "draft" | "active") => {
    if (editingMiniSite) {
      // Edit existing mini-site
      setMiniSites(
        miniSites.map((site) =>
          site.id === editingMiniSite.id
            ? {
                ...site,
                campaignCode: data.campaignCode,
                campaignName: data.campaignName,
                companyName: data.companyName,
                website: data.selectedWebsite,
                startDate: data.startDate,
                endDate: data.endDate,
                status: status,
                voucherAmount: parseFloat(data.voucherAmount),
                totalVouchers: parseFloat(data.totalVouchers),
              }
            : site,
        ),
      );
    } else {
      // Create new mini-site
      const newMiniSite: MiniSite = {
        id: `ms-${miniSites.length + 1}`,
        campaignCode: data.campaignCode,
        campaignName: data.campaignName,
        companyName: data.companyName,
        website: data.selectedWebsite,
        startDate: data.startDate,
        endDate: data.endDate,
        status: status,
        voucherAmount: parseFloat(data.voucherAmount),
        totalVouchers: parseFloat(data.totalVouchers),
        usedVouchers: 0,
        revenue: 0,
        conversionRate: 0,
      };
      setMiniSites([newMiniSite, ...miniSites]);
    }
    setShowWizard(false);
    setEditingMiniSite(null);
  };

  const handleRowClick = (site: MiniSite) => {
    setEditingMiniSite(site);
    setShowWizard(true);
  };

  // Bulk actions handlers
  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedRows?.size === filteredMiniSites?.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredMiniSites?.map((site) => site.id)));
    }
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus || selectedRows.size === 0) return;

    setMiniSites(
      miniSites.map((site) =>
        selectedRows.has(site.id)
          ? { ...site, status: bulkStatus as any }
          : site,
      ),
    );
    setSelectedRows(new Set());
    setBulkStatus("");
  };

  const handleDuplicate = () => {
    if (selectedRows.size !== 1) return;

    const siteId = Array.from(selectedRows)[0];
    const siteToDuplicate = miniSites.find((s) => s.id === siteId);
    if (!siteToDuplicate) return;

    const duplicatedSite: MiniSite = {
      ...siteToDuplicate,
      id: `ms-${miniSites.length + 1}`,
      campaignCode: `${siteToDuplicate.campaignCode}-COPY`,
      campaignName: `${siteToDuplicate.campaignName} (Copy)`,
      status: "draft",
      usedVouchers: 0,
      revenue: 0,
      conversionRate: 0,
    };

    setMiniSites([duplicatedSite, ...miniSites]);
    setSelectedRows(new Set());
  };

  const exportToCSV = () => {
    if (selectedRows.size === 0) return;

    const selectedSites = miniSites.filter((site) => selectedRows.has(site.id));
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
      ...selectedSites.map((site) =>
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

    const selectedSites = miniSites.filter((site) => selectedRows.has(site.id));
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
                  (site) => `
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
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1
              className={`text-3xl mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}
            >
              {t.MiniSiteMgmtPage}
            </h1>
            <p className={textSecondary}>{t.manageAllMiniSiteCampaigns}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t.totalMiniSites || "Total Mini-Sites"}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>{totalCampaigns}</p>
              <p className={`text-xs ${textTertiary}`}>{t.campaigns}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t.activeMiniSites || "Active Mini-Sites"}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>
                {activeCampaigns}
              </p>
              <p className={`text-xs ${textTertiary}`}>{t.campaigns}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t.totalRevenue || "Total Revenue"}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>
                ₪{totalRevenue.toLocaleString()}
              </p>
              <p className={`text-xs ${textTertiary}`}>{t.total}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-orange-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t.totalVouchers || "Total Vouchers"}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>{totalVouchers}</p>
              <p className={`text-xs ${textTertiary}`}>{t.total}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-pink-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t.usedVouchers || "Used Vouchers"}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>{usedVouchers}</p>
              <p className={`text-xs ${textTertiary}`}>{t.vouchers}</p>
            </div>

            <div
              className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <span className={`text-sm ${textPrimary}`}>
                  {t.conversionRate || "Conversion Rate"}
                </span>
              </div>
              <p className={`text-2xl ${textPrimary} mb-1`}>
                {avgConversion.toFixed(1)}%
              </p>
              <p className={`text-xs ${textTertiary}`}>{t.rate}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div
            className={`${bgPrimary} rounded-xl p-4 border ${borderColor} mb-6`}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-1 items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:max-w-md">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
                  />
                  <input
                    type="text"
                    placeholder={t.searchCampaigns}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="active">{t.active}</option>
                  <option value="draft">{t.draft}</option>
                  <option value="completed">{t.completed}</option>
                  <option value="paused">{t.paused}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? "bg-purple-100 dark:bg-purple-950/30 text-purple-600" : `${bgSecondary} ${textSecondary}`}`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-purple-100 dark:bg-purple-950/30 text-purple-600" : `${bgSecondary} ${textSecondary}`}`}
                >
                  <Grid className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowWizard(true)}
                  className="ml-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t.createMiniSite}
                </button>
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
                    {selectedRows.size === 1 ? t.itemSelected : t.itemsSelected}
                  </span>
                  <button
                    onClick={() => setSelectedRows(new Set())}
                    className={`text-sm ${textTertiary} hover:${textSecondary} underline`}
                  >
                    {t.clearSelection}
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
                        {t.changeStatus}
                      </option>
                      <option
                        value="active"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t.active}
                      </option>
                      <option
                        value="draft"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t.draft}
                      </option>
                      <option
                        value="completed"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t.completed}
                      </option>
                      <option
                        value="paused"
                        style={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                        }}
                      >
                        {t.paused}
                      </option>
                    </select>
                    <button
                      onClick={handleBulkStatusChange}
                      disabled={!bulkStatus}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        bulkStatus
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {t.apply}
                    </button>
                  </div>

                  {/* Duplicate - only show when exactly 1 row selected */}
                  {selectedRows.size === 1 && (
                    <button
                      onClick={handleDuplicate}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      {t.duplicate}
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
          {viewMode === "list" ? <MinisiteListView /> : <MinisiteGridView />}
        </div>
      </main>

      {/* Wizard Modal */}
      {showWizard && (
        <MinisiteCreateWizard
          onClose={() => {
            setShowWizard(false);
            setEditingMiniSite(null);
          }}
          onSubmit={handleCreateMiniSite}
          editingMiniSite={editingMiniSite}
        />
      )}
    </>
  );
}
