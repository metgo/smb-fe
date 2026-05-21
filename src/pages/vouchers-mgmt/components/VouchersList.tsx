import { useState, useMemo, useEffect, useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
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
  Send,
} from "lucide-react";

import { toast } from "sonner";
import {
  BulkActionBar,
  PageHeader,
  PageStats,
  ReordableDataTable,
  SearchInput,
} from "@/components/shared";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  isExpired,
  isExpiringSoon,
} from "@/helpers";
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
import { useUserRoles } from "@/hooks/useUserRoles";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";
import TooltipWrapper from "@/components/wrapper/TooltipWrapper";

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
  onAddVoucher: () => void;
  showAddWizard: boolean;
}

const SEARCH_STORAGE_KEY = "voucherSearchTerm";

const VouchersList = ({
  onAddVoucher,
  campaigns,
  showAddWizard,
}: VouchersListProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("vouchers");
  const { t: tt } = useTranslation("toast");
  const { t: tc } = useTranslation("common");

  const { textPrimary, isDark } = useThemeClasses();
  const { isSuperadmin } = useUserRoles();

  const [sendEmail] = useSendEmailMutation();
  const [sendSMS] = useSendSMSMutation();

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
    ...(isSuperadmin ? [{ key: "checkbox", label: "", width: "50px" }] : []),

    {
      key: "code",
      label: t("code"),
      sortable: true,
      render: (voucher: IVoucherItem) => (
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
      render: (voucher: IVoucherItem) => (
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
      render: (voucher: IVoucherItem) => (
        <div className="flex items-center gap-2">
          {voucher?.assigneeInfo?.email ? (
            <TooltipWrapper infoText={voucher?.assigneeInfo?.email} side="top">
              <a
                href={`mailto:${voucher?.assigneeInfo?.email}`}
                onClick={(e) => e.stopPropagation()}
                className={`p-1 transition-colors ${isDark ? "text-gray-400 hover:text-teal-400" : "text-gray-600 hover:text-teal-600"}`}
              >
                <Mail className="w-4 h-4" />
              </a>
            </TooltipWrapper>
          ) : (
            <span>-</span>
          )}
          {voucher?.assigneeInfo?.phone ? (
            <TooltipWrapper infoText={voucher?.assigneeInfo?.phone} side="top">
              <a
                href={`tel:${voucher?.assigneeInfo?.phone}`}
                onClick={(e) => e.stopPropagation()}
                className={`p-1 transition-colors ${isDark ? "text-gray-400 hover:text-teal-400" : "text-gray-600 hover:text-teal-600"}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            </TooltipWrapper>
          ) : (
            <span>-</span>
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
      render: (voucher: IVoucherItem) => (
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
      key: "createdAt",
      label: t("created_at"),
      sortable: true,
      render: (voucher: any) => {
        const textColor = isDark ? "text-gray-100" : "text-gray-900";
        return (
          <span className={`text-sm ${textColor}`}>
            {formatDate(voucher?.creatorInfo?.createdAt)}
          </span>
        );
      },
    },
    {
      key: "expireDate",
      label: t("expiry"),
      sortable: true,
      render: (voucher: IVoucherItem) => {
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

    {
      key: "actions",
      label: tc("action"),
      render: (voucher: IVoucherItem) => (
        <div className="flex items-center gap-2 z-50">
          <TooltipWrapper infoText={t("send_email")} side="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSendSingleEmail(voucher._id);
              }}
              disabled={!voucher?.assigneeInfo?.email}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                !voucher?.assigneeInfo?.email
                  ? "opacity-30 cursor-not-allowed bg-blue-500/10 text-blue-400"
                  : isDark
                    ? "bg-blue-500/15 text-blue-400 hover:bg-blue-500 hover:text-white hover:scale-110 active:scale-95"
                    : "bg-blue-100 text-blue-900 hover:bg-blue-500 hover:text-white hover:scale-110 active:scale-95"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
          </TooltipWrapper>

          <TooltipWrapper infoText={t("send_sms")} side="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSendSingleSMS(voucher._id);
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                !voucher?.assigneeInfo?.phone
                  ? "opacity-30 cursor-not-allowed bg-green-500/10 text-green-600"
                  : isDark
                    ? "bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-white hover:scale-110 active:scale-95"
                    : "bg-green-100 text-green-600 hover:bg-green-500 hover:text-white hover:scale-110 active:scale-95"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </TooltipWrapper>
        </div>
      ),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  const handleVoucherClick = (voucherId: string) => {
    navigate(`${routes.voucherDetails}?voucherId=${voucherId}`, {
      replace: true,
    });
  };

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // ── Amount range with debounce & interaction tracking ──
  const [minAmountLocal, setMinAmountLocal] = useState<number>(0);
  const [maxAmountLocal, setMaxAmountLocal] = useState<number | null>(0);

  const [minAmountDebounced, setMinAmountDebounced] = useState<number>(0);
  const [maxAmountDebounced, setMaxAmountDebounced] = useState<number>(0);

  const [hasInteractedWithAmount, setHasInteractedWithAmount] = useState(false);

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

    // Only include amount filters after user interaction + debounce
    if (hasInteractedWithAmount) {
      if (minAmountDebounced !== undefined && minAmountDebounced > 0) {
        params.amountMin = minAmountDebounced;
      }
    }

    if (dateFrom !== "") params.startDate = dateFrom;
    if (dateTo !== "") params.endDate = dateTo;

    return params;
  }, [
    page,
    searchQuery,
    statusFilter,
    campaignFilter,
    paymentFilter,
    dateFrom,
    dateTo,
    hasInteractedWithAmount,
    minAmountDebounced,
    maxAmountDebounced,
  ]);

  const {
    data: voucherData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllVouchersQuery(voucherQueryParams);

  const allVouchers = voucherData?.data;
  const maxVoucherAmount = voucherData?.highestAmount ?? 1000000;
  const [combinedVouchers, setCombinedVouchers] = useState<IVoucherItem[]>([]);
  const hasMore = voucherData?.meta?.hasNextPage;

  // Debounce amount changes (2 seconds)
  useEffect(() => {
    if (!hasInteractedWithAmount) return;

    const timer = setTimeout(() => {
      setMinAmountDebounced(minAmountLocal);
      setMaxAmountDebounced(maxAmountLocal ?? maxVoucherAmount);
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    minAmountLocal,
    maxAmountLocal,
    hasInteractedWithAmount,
    maxVoucherAmount,
  ]);

  // Initialize maxAmountLocal when we get real max from API
  useEffect(() => {
    if (maxVoucherAmount > 0 && maxAmountLocal === null) {
      setMaxAmountLocal(maxVoucherAmount);
    }
  }, [maxVoucherAmount]);

  useEffect(() => {
    if (!showAddWizard) refetch();
  }, [showAddWizard, refetch]);

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
    paymentFilter,
  ]);

  // Reset page when amount filters change (after debounce)
  useEffect(() => {
    setPage(1);
  }, [minAmountDebounced, maxAmountDebounced]);

  const totalData = voucherData?.datas?.totalData;

  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(
    new Set(),
  );

  const handleSendVoucherEmails = async (): Promise<void> => {
    try {
      await sendEmail({ voucherIds: Array.from(selectedVouchers) }).unwrap();
      toast.success(
        tt("emails_sent_successfully") || "Emails sent successfully",
      );
    } catch (error) {
      console.error("Failed to send voucher emails:", error);
      toast.error(tt("failed_to_send_emails") || "Failed to send emails");
    }
  };

  const handleSendVoucherSMS = async (): Promise<void> => {
    try {
      await sendSMS({ voucherIds: Array.from(selectedVouchers) }).unwrap();
      toast.success(tt("sms_sent_successfully") || "SMS sent successfully");
    } catch (error) {
      console.error("Failed to send voucher SMS:", error);
      toast.error(tt("failed_to_send_sms") || "Failed to send SMS");
    }
  };

  const handleSendSingleEmail = async (voucherId: string): Promise<void> => {
    try {
      await sendEmail({ voucherIds: [voucherId] }).unwrap();
      toast.success(
        tt("emails_sent_successfully") || "Email sent successfully",
      );
    } catch (error) {
      toast.error(t("failed_to_send_emails") || "Failed to send email");
    }
  };

  const handleSendSingleSMS = async (voucherId: string): Promise<void> => {
    try {
      await sendSMS({ voucherIds: [voucherId] }).unwrap();
      toast.success(tt("sms_sent_successfully") || "SMS sent successfully");
    } catch (error) {
      toast.error(t("failed_to_send_sms") || "Failed to send SMS");
    }
  };

  const [showFilters, setShowFilters] = useState(false);

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
        get: (v: any) =>
          [v?.assigneeInfo?.email, v.phone].filter(Boolean).join(" | ") || "-",
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

    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vouchers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [
    combinedVouchers,
    t,
    getStatusLabel,
    formatDate,
    isExpired,
    isExpiringSoon,
  ]);

  return (
    <>
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
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between flex-wrap mt-4 gap-4">
        <div className="flex-1 relative min-w-62.5">
          <SearchInput
            placeholder={t("search_voucher_placeholder")}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            storageKey={SEARCH_STORAGE_KEY}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSVVouchers}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
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
          className={`py-4 border-b transition-colors ${
            isDark ? "border-gray-800" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="grid grid-cols-12 gap-4">
            {/* Status */}
            <div className="col-span-2">
              <FilterSelect
                label={t("status")}
                value={statusFilter}
                onChange={setStatusFilter}
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

            {/* Campaign */}
            <div className="col-span-2">
              <FilterSelect
                label={t("campaign")}
                value={campaignFilter}
                onChange={setCampaignFilter}
                options={[
                  { value: "all", label: t("all") },
                  ...(campaigns?.datas?.data || []).map((campaign) => ({
                    value: campaign._id,
                    label: campaign.name,
                  })),
                ]}
              />
            </div>

            {/* Payment status */}
            <div className="col-span-2">
              <FilterSelect
                label={t("payment_status")}
                value={paymentFilter}
                onChange={setPaymentFilter}
                options={[
                  { value: "all", label: t("all") },
                  { value: "unpaid", label: t("unpaid") },
                  { value: "paid", label: t("paid") },
                  { value: "failed", label: t("failed") },
                ]}
              />
            </div>

            {/* Date Range */}
            <div className="col-span-4">
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
                  className={`w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={`w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>

            {/* Amount Range - Dual slider with debounce */}
            <div className="col-span-2">
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("amount_range")}
              </label>
              <div className="space-y-3 pt-3">
                <Slider.Root
                  className="relative flex items-center w-full h-5 select-none touch-none"
                  min={0}
                  max={maxVoucherAmount}
                  step={100}
                  value={[minAmountLocal, maxAmountLocal ?? maxVoucherAmount]}
                  onValueChange={([min, max]) => {
                    setHasInteractedWithAmount(true);
                    setMinAmountLocal(min);
                    setMaxAmountLocal(max);
                  }}
                >
                  <Slider.Track
                    className={`relative grow rounded-full h-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <Slider.Range className="absolute h-full rounded-full bg-teal-500" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-4 h-4 rounded-full bg-teal-500 shadow border-2 border-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                    aria-label="Minimum amount"
                  />
                  <Slider.Thumb
                    className="block w-4 h-4 rounded-full bg-teal-500 shadow border-2 border-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                    aria-label="Maximum amount"
                  />
                </Slider.Root>

                <div
                  className={`flex items-center justify-between text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <span>₪{minAmountLocal.toLocaleString()}</span>
                  <span>
                    ₪{(maxAmountLocal ?? maxVoucherAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clear All Filters */}
          {(statusFilter !== "all" ||
            campaignFilter !== "all" ||
            paymentFilter !== "all" ||
            searchQuery ||
            dateFrom ||
            dateTo ||
            hasInteractedWithAmount) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCampaignFilter("all");
                  setPaymentFilter("all");
                  setSearchQuery("");
                  setDateFrom("");
                  setDateTo("");
                  setHasInteractedWithAmount(false);
                  setMinAmountLocal(0);
                  setMaxAmountLocal(null);
                  setMinAmountDebounced(0);
                  setMaxAmountDebounced(0);
                }}
                className={`text-sm flex items-center gap-1 transition-colors ${
                  isDark
                    ? "text-teal-400 hover:text-teal-300"
                    : "text-teal-600 hover:text-teal-700"
                }`}
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
        <div className="mt-3">
          <BulkActionBar
            selectedItemCount={selectedVouchers.size}
            hancleClearSelection={() => setSelectedVouchers(new Set())}
            handleSendEmail={handleSendVoucherEmails}
            handleSendSMS={handleSendVoucherSMS}
          />
        </div>
      )}

      {/* Table */}
      <div className="mt-3">
        <ReordableDataTable
          rowKey="_id"
          columns={columns}
          next={fetchNextPage}
          hasMore={hasMore}
          data={combinedVouchers}
          isDataLoading={isLoading}
          selectedItems={selectedVouchers}
          onSelectionChange={setSelectedVouchers}
          onRowClick={(voucher) => handleVoucherClick(voucher._id)}
          storageKey="vouchersTableColumnOrder"
        />
      </div>

      {showAddWizard && (
        <BulkUploadButton
          isOpen={showAddWizard}
          onClose={() => {
            /* handled by parent */
          }}
        />
      )}
    </>
  );
};

export default VouchersList;
