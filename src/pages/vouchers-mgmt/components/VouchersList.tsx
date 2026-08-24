import clsx from "clsx";
import { toast } from "sonner";
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
  SlidersHorizontal,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  BulkActionBar,
  ReordableDataTable,
  SearchInput,
} from "@/components/shared";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  isExpired,
  isExpiringSoon,
} from "@/helpers";
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
import TooltipWrapper from "@/components/wrapper/TooltipWrapper";

const LIMIT = 20;
const SEARCH_STORAGE_KEY = "voucherSearchTerm";

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

const VouchersList = ({
  onAddVoucher,
  campaigns,
  showAddWizard,
}: VouchersListProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("vouchers");
  const { t: tt } = useTranslation("toast");
  const { t: tc } = useTranslation("common");
  const { isDark } = useThemeClasses();
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
        icon: <Ticket className="w-5 h-5 text-purple-500" />,
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
        icon: <DollarSign className="w-5 h-5 text-green-500" />,
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
        icon: <Clock className="w-5 h-5 text-orange-500" />,
      },
      {
        id: 4,
        title: t("redeemed_vouchers"),
        value: voucherStatsResponse?.redeemedVouchers?.toLocaleString() ?? "0",
        label: `${voucherStatsResponse?.redemptionRate?.toFixed(1) ?? 0}% ${t("redemption_rate")}`,
        icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      },
      {
        id: 5,
        title: t("unassigned_vouchers"),
        value:
          voucherStatsResponse?.unassignedVouchers?.toLocaleString() ?? "0",
        label: t("available"),
        icon: <Package className="w-5 h-5 text-gray-500" />,
      },
    ],
    [voucherStatsResponse, t],
  );

  const columns = useMemo(
    () =>
      [
        ...(isSuperadmin
          ? [{ key: "checkbox", label: "", width: "50px" }]
          : []),
        ...(isSuperadmin
          ? [
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
            ]
          : []),
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
                <TooltipWrapper
                  infoText={voucher?.assigneeInfo?.email}
                  side="top"
                >
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
                <TooltipWrapper
                  infoText={voucher?.assigneeInfo?.phone}
                  side="top"
                >
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
          render: (voucher: any) => (
            <span
              className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
            >
              {formatDate(voucher?.creatorInfo?.createdAt)}
            </span>
          ),
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
      ].filter(Boolean) as {
        key: string;
        label: string;
        width?: string;
        sortable?: boolean;
        render?: (row: any) => React.ReactNode;
      }[],
    [isSuperadmin, isDark, t],
  );

  const handleVoucherClick = (voucherId: string) => {
    navigate(`${routes.voucherDetails}?voucherId=${voucherId}`, {
      replace: true,
    });
  };

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);

  const [minAmountLocal, setMinAmountLocal] = useState<number>(0);
  const [maxAmountLocal, setMaxAmountLocal] = useState<number | null>(null);
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
  const totalData = voucherData?.datas?.totalData ?? voucherData?.meta?.total ?? 0;

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

  useEffect(() => {
    setPage(1);
  }, [minAmountDebounced, maxAmountDebounced]);

  // Collapse controls on scroll
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        (target && target.scrollTop && target.scrollTop > 20) ||
        window.scrollY > 20
      ) {
        setShowControlsDrawer(false);
      }
    };
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", handleScroll, {
        capture: true,
      } as any);
  }, []);

  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(
    new Set(),
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery?.trim()) count += 1;
    if (statusFilter !== "all") count += 1;
    if (campaignFilter !== "all") count += 1;
    if (paymentFilter !== "all") count += 1;
    if (dateFrom || dateTo) count += 1;
    if (hasInteractedWithAmount) count += 1;
    return count;
  }, [
    searchQuery,
    statusFilter,
    campaignFilter,
    paymentFilter,
    dateFrom,
    dateTo,
    hasInteractedWithAmount,
  ]);

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

    const exportColumns = [
      ...(isSuperadmin
        ? [{ key: "code", header: t("code"), get: (v: any) => v.code ?? "-" }]
        : []),
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
      exportColumns.map((c) => escape(c.header)).join(","),
      ...vouchersList.map((v: any) =>
        exportColumns.map((c) => escape(c.get(v))).join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vouchers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [combinedVouchers, t, isSuperadmin]);

  const clearAllFilters = () => {
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
  };

  const filterToggleButton = (
    <button
      onClick={() => setShowControlsDrawer((prev) => !prev)}
      className={clsx(
        "relative p-2 rounded-xl border transition-all cursor-pointer shrink-0",
        showControlsDrawer
          ? "bg-teal-600 text-white border-teal-500 shadow-teal-500/20"
          : isDark
            ? "bg-gray-900 border-gray-800 text-teal-400 hover:bg-gray-800 hover:border-teal-500/40"
            : "bg-gray-100 border-gray-200 text-teal-700 hover:bg-gray-200 hover:border-teal-400",
      )}
      title={
        showControlsDrawer
          ? tc("close_options") ?? "Close Options"
          : tc("search_and_filters") ?? "Search & Filters"
      }
    >
      <SlidersHorizontal className="w-4 h-4" />
      {activeFilterCount > 0 && (
        <span
          className={clsx(
            "absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none",
            showControlsDrawer
              ? "bg-white text-teal-600"
              : "bg-teal-500 text-white",
          )}
        >
          {activeFilterCount > 9 ? "9+" : activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Sticky Top Header — same design as Events */}
      <div
        className={clsx(
          "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
          isDark
            ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
        )}
      >
        <ListHeaderBar
          title={t("vouchers_management")}
          titleGradient="from-purple-500 via-violet-600 to-indigo-600"
          count={totalData}
          addLabel={t("add_voucher")}
          onAdd={onAddVoucher}
          stats={voucherStats}
          isStatsLoading={isStatsLoading}
          filterToggle={filterToggleButton}
        />
      </div>

      {/* Expandable Search, Filters & Controls Panel */}
      {showControlsDrawer && (
        <div
          className={clsx(
            "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-0 relative">
              <SearchInput
                placeholder={t("search_voucher_placeholder")}
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <FilterButton value={showFilters} onChange={setShowFilters} />
              <button
                onClick={handleExportCSVVouchers}
                className={clsx(
                  "flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-lg border transition-colors",
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
                )}
                title={t("downloadCSV")}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t("downloadCSV")}</span>
              </button>
            </div>
          </div>

          {(showFilters || activeFilterCount > 0) && (
            <div
              className={clsx(
                "px-4 pb-2 rounded-md",
                isDark ? "bg-gray-950/50" : "bg-gray-50",
              )}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 pt-2">
                {/* Status */}
                <div className="lg:col-span-2">
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
                <div className="lg:col-span-2">
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
                <div className="lg:col-span-2">
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
                <div className="sm:col-span-2 lg:col-span-4">
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

                {/* Amount Range */}
                <div className="sm:col-span-2 lg:col-span-2">
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
                      value={[
                        minAmountLocal,
                        maxAmountLocal ?? maxVoucherAmount,
                      ]}
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

              {/* Clear All */}
              {activeFilterCount > 0 && (
                <div className="mt-4">
                  <button
                    onClick={clearAllFilters}
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
        </div>
      )}

      {/* Bulk Actions */}
      {selectedVouchers.size > 0 && (
        <BulkActionBar
          selectedItemCount={selectedVouchers.size}
          hancleClearSelection={() => setSelectedVouchers(new Set())}
          handleSendEmail={handleSendVoucherEmails}
          handleSendSMS={handleSendVoucherSMS}
        />
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <ReordableDataTable
          rowKey="_id"
          columns={columns}
          next={fetchNextPage}
          hasMore={hasMore}
          data={combinedVouchers}
          isDataLoading={isLoading || isFetching}
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