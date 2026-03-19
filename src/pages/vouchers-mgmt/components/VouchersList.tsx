import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  Mail,
  Phone,
  Clock,
  Ticket,
  DollarSign,
  CheckCircle,
  Package,
  Download,
} from "lucide-react";

import { toast } from "sonner";
import {
  BulkActionBar,
  PageHeader,
  PageStats,
  ReordableDataTable,
  SearchInput,
} from "@/components/shared";
import { formatDate, getStatusColor, getStatusLabel } from "@/helpers";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FilterButton } from "@/components/btns";
import {
  useGetAllVouchersQuery,
  useGetVoucherStatsQuery,
} from "@/store/api/voucherQueryApi";
import { FilterSelect } from "@/pages/orders-mgmt/components";
import { BulkUploadButton } from "@/components/shared/BulkUploadButton";
import {
  useSendEmailMutation,
  useSendSMSMutation,
} from "@/store/api/voucherMutationApi";

const LIMIT = 20;
interface Campaign {
  _id: string;
  name: string;
}

interface CampaignsResponse {
  datas?: {
    data: Campaign[];
  };
}
interface VouchersListProps {
  campaigns?: CampaignsResponse;
  onVoucherClick: (voucherId: string) => void;
  onAddVoucher: () => void;
  refreshTrigger: number;
}

const USER_ROLE = "admin";

const VouchersList = ({
  onVoucherClick,
  onAddVoucher,
  campaigns,
}: VouchersListProps) => {
  const { textPrimary } = useThemeClasses();
  const { isDark } = useThemeClasses();
  const [sendEmail] = useSendEmailMutation();
  const [sendSMS] = useSendSMSMutation();

  const SEARCH_STORAGE_KEY = "voucherSearchTerm";
  // Permission check
  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );
  const { t } = useTranslation("vouchers");
  const { data: voucherStatsResponse, isLoading: isStatsLoading } =
    useGetVoucherStatsQuery({});

  const voucherStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total_vouchers"),
        value: voucherStatsResponse?.totalVouchers?.toLocaleString() ?? "0",
        label: t("all_time"),
        icon: <Ticket className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 2,
        title: t("total_voucher_value"),
        value:
          voucherStatsResponse?.totalRevenue != null
            ? voucherStatsResponse.totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00",
        label: t("generated_revenue"),
        icon: <DollarSign className="w-5 h-5 text-green-600" />,
      },
      {
        id: 3,
        title: t("total_amount_to_redeem"),
        value:
          voucherStatsResponse?.totalRemainingBalance != null
            ? voucherStatsResponse.totalRemainingBalance.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )
            : "0.00",
        label: t("pending_redemption"),
        icon: <Clock className="w-5 h-5 text-orange-600" />,
      },
      {
        id: 4,
        title: t("redeemed_vouchers"),
        value: voucherStatsResponse?.redeemedVouchers?.toLocaleString() ?? "0",
        label: `${voucherStatsResponse?.redemptionRate?.toFixed(1) ?? 0}% ${t("redemption_rate")}`,
        icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
      },
      {
        id: 5,
        title: t("unassigned_vouchers"),
        value:
          voucherStatsResponse?.unassignedVouchers?.toLocaleString() ?? "0",
        label: t("available"),
        icon: <Package className="w-5 h-5 text-gray-600" />,
      },
    ],
    [voucherStatsResponse, t],
  );

  const columns = [
    ...(canChangeStatus ? [{ key: "checkbox", label: "", width: "50px" }] : []),

    {
      key: "code",
      label: t("code"),
      sortable: true,
      render: (voucher: any) => (
        <span
          className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          {voucher.code}
        </span>
      ),
    },

    {
      key: "assignee",
      label: t("assignee"),
      sortable: true,
      render: (voucher: any) => (
        <span
          className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          {voucher?.assigneeInfo?.name || "-"}
        </span>
      ),
    },

    {
      key: "contact",
      label: t("contact"),
      sortable: false,
      render: (voucher: any) => (
        <div className="flex items-center gap-2">
          {voucher.email ? (
            <a
              href={`mailto:${voucher.email}`}
              onClick={(e) => e.stopPropagation()}
              className={`p-1 transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-teal-400"
                  : "text-gray-600 hover:text-teal-600"
              }`}
              title={voucher.email}
            >
              <Mail className="w-4 h-4" />
            </a>
          ) : (
            <div>-</div>
          )}
          {voucher.phone ? (
            <a
              href={`tel:${voucher.phone}`}
              onClick={(e) => e.stopPropagation()}
              className={`p-1 transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-teal-400"
                  : "text-gray-600 hover:text-teal-600"
              }`}
              title={voucher.phone}
            >
              <Phone className="w-4 h-4" />
            </a>
          ) : (
            <div>-</div>
          )}
        </div>
      ),
    },

    {
      key: "status",
      label: t("status"),
      sortable: true,
      render: (voucher: any) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
            voucher.status,
          )}`}
        >
          {getStatusLabel(voucher.status)}
        </span>
      ),
    },

    {
      key: "amount",
      label: t("amount"),
      sortable: true,
      render: (voucher: any) => (
        <span
          className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          ₪{voucher.amount}
        </span>
      ),
    },

    {
      key: "remainingAmount",
      label: t("remaining"),
      sortable: true,
      render: (voucher: any) => (
        <span
          className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          ₪{voucher.remainingAmount}
        </span>
      ),
    },

    {
      key: "expireDate",
      label: t("expiry"),
      sortable: true,
      render: (voucher: any) => {
        const expired = isExpired(voucher.expireDate);
        const expiringSoon = isExpiringSoon(voucher.expireDate);
        const textColor = expired
          ? isDark
            ? "text-red-400"
            : "text-red-600"
          : expiringSoon
            ? isDark
              ? "text-orange-400"
              : "text-orange-400"
            : isDark
              ? "text-gray-100"
              : "text-gray-900";

        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${textColor}`}>
              {formatDate(voucher.expireDate)}
            </span>
            {expiringSoon && !expired && (
              <span title={t("expiring_soon")}>
                <Clock
                  className={`w-4 h-4 ${isDark ? "text-orange-400" : "text-orange-500"}`}
                />
              </span>
            )}
          </div>
        );
      },
    },

    {
      key: "campaign",
      label: t("campaign"),
      sortable: true,
      render: (voucher: any) => (
        <span
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {voucher.campId || "-"}
        </span>
      ),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  const [isOpen, setIsOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const [websiteFilter, setWebsiteFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(1000);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const voucherQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: LIMIT,
    };

    if (searchQuery) params.search = searchQuery;
    if (statusFilter !== "all") params.status = statusFilter.toUpperCase();
    if (campaignFilter !== "all") params.campId = campaignFilter;
    if (paymentFilter !== "all")
      params.paymentStatus = paymentFilter.toUpperCase();

    if (minAmount) params.amountMin = minAmount;
    if (maxAmount) params.amountMax = maxAmount;
    if (dateFrom !== "") params.startDate = dateFrom;
    if (dateTo !== "") params.endDate = dateTo;

    return params;
  }, [
    page,
    searchQuery,
    statusFilter,
    campaignFilter,
    maxAmount,
    minAmount,
    dateFrom,
    dateTo,
    paymentFilter,
  ]);
  const {
    data: voucherData,
    isLoading,
    isFetching,
    // refetch,
  } = useGetAllVouchersQuery(voucherQueryParams);

  const allVouchers = voucherData?.data;
  const maxVoucherAmount = voucherData?.highestAmount;
  const [combinedVouchers, setCombinedVouchers] = useState<any[]>([]);
  const hasMore = voucherData?.meta?.hasNextPage;
  // const [updateVoucher, { isLoading: isSaving }] = useUpdateVoucherMutation();

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  useEffect(() => {
    if (!allVouchers?.length) {
      setCombinedVouchers([]);
      return;
    }
    setCombinedVouchers((prev) => {
      if (page === 1) return allVouchers;
      const existingIds = new Set(prev.map((p) => p._id));
      const newItems = allVouchers?.filter((p: any) => !existingIds.has(p._id));
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [allVouchers, page]);

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    statusFilter,
    campaignFilter,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
  ]);

  const totalData = voucherData?.datas?.totalData;

  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(
    new Set(),
  );

  const handleSendVoucherEmails = async (): Promise<void> => {
    try {
      await sendEmail({
        voucherIds: Array.from(selectedVouchers),
      }).unwrap();
    } catch (error) {
      console.error("Failed to send voucher emails:", error);
      throw error;
    }
  };
  const handleSendVoucherSMS = async (): Promise<void> => {
    try {
      await sendSMS({
        voucherIds: Array.from(selectedVouchers),
      }).unwrap();
    } catch (error) {
      console.error("Failed to send voucher SMS:", error);
      throw error;
    }
  };

  // // Expiration
  // const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  // const [newExpireDate, setNewExpireDate] = useState<string>("");
  // // status change
  // const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  // const [newStatus, setNewStatus] = useState<string>("");

  // const handleExtendExpiration = async () => {
  //   try {
  //     await updateVoucher({
  //       voucherId: Array.from(selectedVouchers),
  //       body: { expireDate: new Date(newExpireDate) },
  //     }).unwrap();
  //     setIsExtendModalOpen(false);
  //     setNewExpireDate("");
  //   } catch (error) {
  //     console.error("Failed to extend expiration:", error);
  //   }
  // };

  const [showFilters, setShowFilters] = useState(false);

  // Calculate min/max amounts from data
  const amountRange = useMemo(() => {
    return {
      min: 0, // assuming the minimum is 0, adjust if needed
      max: maxVoucherAmount,
    };
  }, [maxVoucherAmount]);

  const isExpiringSoon = (date: string) => {
    const daysUntilExpiry = Math.floor(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };
  // Initialize slider values based on data
  const [isInitialized, setIsInitialized] = useState(false);
  if (!isInitialized && amountRange.min && amountRange.max) {
    setMinAmount(amountRange.min);
    setMaxAmount(amountRange.max);
    setIsInitialized(true);
  }

  const handleExportCSVVouchers = useCallback(() => {
    const vouchersList = combinedVouchers ?? [];
    if (!vouchersList.length) {
      toast.message(t("noDataToExport") || "No vouchers to export");
      return;
    }

    const escape = (v: any) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const columns = [
      { key: "code", header: t("code"), get: (v: any) => v.code ?? "-" },
      {
        key: "assignee",
        header: t("assignee"),
        get: (v: any) => v?.assigneeInfo?.name ?? "-",
      },
      {
        key: "contact",
        header: t("contact"),
        get: (v: any) => [v.email, v.phone].filter(Boolean).join(" | ") || "-",
      },
      {
        key: "status",
        header: t("status"),
        get: (v: any) => getStatusLabel(v.status) ?? v.status ?? "-",
      },
      {
        key: "amount",
        header: t("amount"),
        get: (v: any) =>
          v.amount != null ? `₪${Number(v.amount).toLocaleString()}` : "-",
      },
      {
        key: "remaining",
        header: t("remaining"),
        get: (v: any) =>
          v.remainingAmount != null
            ? `₪${Number(v.remainingAmount).toLocaleString()}`
            : "-",
      },
      {
        key: "expiry",
        header: t("expiry"),
        get: (v: any) => {
          if (!v.expireDate) return "-";
          let txt = formatDate(v.expireDate);
          if (isExpired(v.expireDate)) txt += " (expired)";
          else if (isExpiringSoon(v.expireDate)) txt += " (expiring soon)";
          return txt;
        },
      },
      {
        key: "campaign",
        header: t("campaign"),
        get: (v: any) => v.campId ?? v.campaign?.name ?? "-",
      },
    ];

    const csv = [
      columns.map((c) => escape(c.header)).join(","),
      ...vouchersList.map((v: any) =>
        columns.map((c) => escape(c.get(v))).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vouchers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [
    allVouchers,
    t,
    getStatusLabel,
    formatDate,
    isExpired,
    isExpiringSoon,
    combinedVouchers,
  ]);

  return (
    <div className={`flex-1 flex flex-col transition-all duration-300`}>
      {/* Page Title and Actions */}
      <div
        className={`transition-colors ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <PageHeader
          title={t("vouchers_management")}
          description={t("create_track_manage_vouchers")}
          btnLabel={t("add_voucher")}
          h1Gradient={textPrimary}
          onClick={onAddVoucher}
          totalCount={totalData || 0}
        />
        <PageStats
          stats={voucherStats}
          isLoading={isStatsLoading}
          className="grid grid-cols-1  lg:grid-cols-5 gap-4"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between flex-wrap mt-4 gap-4">
        {/* Left: Search */}
        <div className="flex-1 relative min-w-62.5">
          <SearchInput
            placeholder={t("search_voucher_placeholder")}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            storageKey={SEARCH_STORAGE_KEY}
          />
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3">
          {/* <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            <NotebookPen className="w-4 h-4" />

            {t("bulk_upload")}
          </button> */}

          <button
            onClick={handleExportCSVVouchers}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            }`}
            title={t("downloadCSV")}
          >
            <Download className="w-4 h-4" />
            <span>{t("downloadCSV")}</span>
          </button>

          <FilterButton value={showFilters} onChange={setShowFilters} />
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div
          className={` py-4 border-b transition-colors ${isDark ? "bg-gray-800/50 border-gray-800" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <FilterSelect
                label={t("status")}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: "all", label: t("all") },
                  { value: "assigned", label: t("assigned") },
                  { value: "unassigned", label: t("unassigned") },
                  { value: "waiting", label: t("waiting") },

                  { value: "expired", label: t("expired") },
                  { value: "redeemed", label: t("redeemed") },
                ]}
              />
            </div>

            {/* Campaign Filter */}
            <div>
              <FilterSelect
                label={t("campaign")}
                value={campaignFilter}
                onChange={(value) => setCampaignFilter(value)}
                options={[
                  { value: "all", label: t("all") },
                  ...(campaigns?.datas?.data || []).map((campaign) => ({
                    value: campaign._id,
                    label: `${campaign.name}`,
                  })),
                ]}
              />
            </div>

            {/* Payment status filter */}
            <div>
              <FilterSelect
                label={t("payment_status")}
                value={paymentFilter}
                onChange={(value) => setPaymentFilter(value)}
                options={[
                  { value: "all", label: t("all") },
                  { value: "unpaid", label: t("unpaid") },
                  { value: "paid", label: t("paid") },
                  { value: "failed", label: t("failed") },
                ]}
              />
            </div>

            {/* Date Range */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("date_range")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={`w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={`w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                />
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("amount_range")}
              </label>
              <div className="space-y-2">
                <div className="relative pt-3">
                  <input
                    type="range"
                    min={amountRange.min}
                    max={amountRange.max}
                    value={minAmount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val <= maxAmount) setMinAmount(val);
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none z-20 cursor-pointer"
                  />
                  <input
                    type="range"
                    min={amountRange.min}
                    max={amountRange.max}
                    value={maxAmount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= minAmount) setMaxAmount(val);
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none z-10 cursor-pointer"
                  />
                  <div
                    className={`relative h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <div
                      className="absolute h-2 bg-teal-500 rounded-full"
                      style={{
                        left: `${((minAmount - amountRange.min) / (amountRange.max - amountRange.min)) * 100}%`,
                        right: `${100 - ((maxAmount - amountRange.min) / (amountRange.max - amountRange.min)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`flex items-center justify-between text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <span>₪{minAmount}</span>
                  <span>₪{maxAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clear All Filters Button */}
          {(statusFilter !== "all" ||
            campaignFilter !== "all" ||
            websiteFilter !== "all" ||
            paymentFilter !== "all" ||
            searchQuery ||
            minAmount !== amountRange.min ||
            maxAmount !== amountRange.max ||
            dateFrom ||
            dateTo) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCampaignFilter("all");
                  setWebsiteFilter("all");
                  setPaymentFilter("");
                  setSearchQuery("all");
                  setMinAmount(amountRange.min);
                  setMaxAmount(amountRange.max);
                  setDateFrom("");
                  setDateTo("");
                }}
                className={`text-sm flex items-center gap-1 transition-colors ${isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`}
              >
                <X className="w-4 h-4" />
                {t("clear_all")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedVouchers.size > 0 && (
        <BulkActionBar
          selectedItemCount={selectedVouchers.size}
          hancleClearSelection={() => setSelectedVouchers(new Set())}
          handleSendEmail={() => {
            handleSendVoucherEmails();
          }}
          handleSendSMS={() => {
            handleSendVoucherSMS();
          }}
          // handleExtendExpiration={() => setIsExtendModalOpen(true)}
        />
      )}

      {/* Scrollable Table Content */}
      <div className="flex flex-col overflow-hidden h-[calc(100vh-450px)] mt-3">
        <div className="sticky">
          <ReordableDataTable
            rowKey="_id"
            next={fetchNextPage}
            hasMore={hasMore}
            data={combinedVouchers}
            isDataLoading={isLoading}
            selectedItems={selectedVouchers}
            onSelectionChange={setSelectedVouchers}
            onRowClick={(voucher) => onVoucherClick(voucher)}
            storageKey="vouchersTableColumnOrder"
            columns={columns}
            t={t}
          />
        </div>
      </div>

      <div>
        {isOpen && (
          <div>
            <BulkUploadButton
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Extend expiration date */}
      {/* {isExtendModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Extend Expiration Date
            </h3>
            <input
              type="datetime-local"
              value={newExpireDate}
              onChange={(e) => setNewExpireDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsExtendModalOpen(false);
                  setNewExpireDate("");
                }}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendExpiration}
                disabled={!newExpireDate || isSaving}
                className="px-4 py-2 text-sm rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default VouchersList;
