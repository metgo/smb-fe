import React, { useState, useMemo } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  Send,
  XCircle,
  Calendar,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { MessageComposerModal } from "@/pages/content-mgmt/components";
import { SendResultsModal } from "@/pages/content-mgmt/components";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/hooks";
import {
  PageHeader,
  ReordableDataTable,
  SearchInput,
} from "@/components/shared";
import { formatDate, getStatusColor, getStatusLabel } from "@/helpers";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FilterButton } from "@/components/btns";
import { useGetAllVouchersQuery } from "@/store/api/voucherQueryApi";
interface Voucher {
  id: string;
  code: string;
  assigneeName: string;
  email: string;
  phone: string;
  status:
    | "active"
    | "assigned"
    | "redeemed"
    | "expired"
    | "cancelled"
    | "UNASSIGNED";
  amount: number;
  remainingAmount: number;
  expirationDate: string;
  campaign: string;
  website: string;
  createdAt: string;
  assignedAt?: string;
  creatorName: string;
  creatorEmail: string;
  creatorPhone: string;
}

interface VouchersListProps {
  // language: Language;
  // theme: Theme;
  // isSidebarCollapsed: boolean;
  onVoucherClick: (voucherId: string) => void;
  onAddVoucher: () => void;
  refreshTrigger: number;
}

// Mock data generator
const generateMockVouchers = (): Voucher[] => {
  const statuses: Voucher["status"][] = [
    "active",
    "assigned",
    "UNASSIGNED",

    "redeemed",
    "expired",
    "cancelled",
  ];
  const campaigns = [
    "Summer Sale 2024",
    "New Year Promo",
    "Spring Festival",
    "Holiday Special",
    "VIP Members",
    "Welcome Bonus",
  ];
  const websites = [
    "visitnegev.com",
    "negevtourism.org",
    "explorenegev.il",
    "negev-adventures.com",
  ];
  const firstNames = [
    "Yael",
    "David",
    "Sarah",
    "Michael",
    "Rachel",
    "Daniel",
    "Leah",
    "Joshua",
    "Miriam",
    "Benjamin",
  ];
  const lastNames = [
    "Cohen",
    "Levi",
    "Mizrahi",
    "Peretz",
    "Biton",
    "Dahan",
    "Avraham",
    "Friedman",
    "Katz",
    "Ben-David",
  ];

  return Array.from({ length: 150 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const amount = [100, 200, 300, 500, 1000][Math.floor(Math.random() * 5)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const remainingAmount =
      status === "redeemed"
        ? 0
        : status === "expired" || status === "cancelled"
          ? amount
          : Math.floor(amount * Math.random());

    return {
      id: `voucher-${i + 1}`,
      code: `VCH-${String(i + 1).padStart(6, "0")}`,
      assigneeName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+972-5${Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status,
      amount,
      remainingAmount,
      expirationDate: new Date(
        Date.now() + (Math.random() * 365 - 180) * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      website: websites[Math.floor(Math.random() * websites.length)],
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      assignedAt:
        status !== "active"
          ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          : undefined,
      creatorName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      creatorEmail: `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}.${lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()}@example.com`,
      creatorPhone: `+972-5${Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
    };
  });
};
const USER_ROLE = "admin";

export function VouchersList({
  onVoucherClick,
  onAddVoucher,
  // refreshTrigger,
}: VouchersListProps) {
  const { textPrimary } = useThemeClasses();
  const { isDark } = useThemeClasses();

  const SEARCH_STORAGE_KEY = "voucherSearchTerm";
  // Permission check
  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );
  const { t } = useTranslation("vouchers");

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
          {voucher.email && (
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
          )}
          {voucher.phone && (
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
              : "text-orange-600"
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
          {voucher.campaign || "-"}
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
  const {
    data: voucherData,
    isLoading,
    // isFetching,
    // refetch,
  } = useGetAllVouchersQuery({});
  const allVouchers = voucherData?.datas?.data;
  const totalData = voucherData?.datas?.totalData;

  const [vouchers] = useState<Voucher[]>(generateMockVouchers());
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(
    new Set(),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const { theme } = useAppSelector((state) => state.settings);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [websiteFilter, setWebsiteFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(1000);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [creatorSearch, setCreatorSearch] = useState("");

  // Calculate min/max amounts from data
  const amountRange = useMemo(() => {
    const amounts = vouchers.map((v) => v.amount);
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    };
  }, [vouchers]);

  // Initialize slider values based on data
  const [isInitialized, setIsInitialized] = useState(false);
  if (!isInitialized && amountRange.min && amountRange.max) {
    setMinAmount(amountRange.min);
    setMaxAmount(amountRange.max);
    setIsInitialized(true);
  }

  // Get unique values for filters
  const campaigns = useMemo(() => {
    return Array.from(new Set(vouchers.map((v) => v.campaign))).sort();
  }, [vouchers]);

  const websites = useMemo(() => {
    return Array.from(new Set(vouchers.map((v) => v.website))).sort();
  }, [vouchers]);

  // Apply filters
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      if (statusFilter !== "all" && voucher.status !== statusFilter)
        return false;
      if (campaignFilter !== "all" && voucher.campaign !== campaignFilter)
        return false;
      if (websiteFilter !== "all" && voucher.website !== websiteFilter)
        return false;
      if (
        searchQuery &&
        !voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !voucher.assigneeName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !voucher.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (minAmount && voucher.amount < minAmount) return false;
      if (maxAmount && voucher.amount > maxAmount) return false;
      if (dateFrom && new Date(voucher.createdAt) < new Date(dateFrom))
        return false;
      if (dateTo && new Date(voucher.createdAt) > new Date(dateTo))
        return false;
      if (
        creatorSearch &&
        !voucher.creatorName.toLowerCase().includes(creatorSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    vouchers,
    statusFilter,
    campaignFilter,
    websiteFilter,
    searchQuery,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
    creatorSearch,
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredVouchers.length;
    const assigned = filteredVouchers.filter(
      (v) => v.status === "assigned" || v.status === "redeemed",
    ).length;
    const redeemed = filteredVouchers.filter(
      (v) => v.status === "redeemed",
    ).length;
    const expired = filteredVouchers.filter(
      (v) => v.status === "expired",
    ).length;
    const totalBalance = filteredVouchers.reduce(
      (sum, v) => sum + v.remainingAmount,
      0,
    );
    const revenue = filteredVouchers
      .filter((v) => v.status === "redeemed")
      .reduce((sum, v) => sum + v.amount, 0);

    return {
      total,
      assigned,
      redeemed,
      expired,
      totalBalance,
      revenue,
    };
  }, [filteredVouchers]);

  // const handleSelectAll = () => {
  //   if (selectedVouchers.size === filteredVouchers.length) {
  //     setSelectedVouchers(new Set());
  //   } else {
  //     setSelectedVouchers(new Set(filteredVouchers.map((v) => v.id)));
  //   }
  // };

  // const handleSelectVoucher = (voucherId: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   const newSelected = new Set(selectedVouchers);
  //   if (newSelected.has(voucherId)) {
  //     newSelected.delete(voucherId);
  //   } else {
  //     newSelected.add(voucherId);
  //   }
  //   setSelectedVouchers(newSelected);
  // };

  const isExpiringSoon = (date: string) => {
    const daysUntilExpiry = Math.floor(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };
  const [messageComposerOpen, setMessageComposerOpen] = useState(false);
  const [sendResultsOpen, setSendResultsOpen] = useState(false);
  const [sendResults, _setSendResults] = useState([]);

  const handleSendMessage = (data: any) => {
    const selectedVoucherData = filteredVouchers.filter((v) =>
      selectedVouchers.has(v.id),
    );

    // Simulate sending messages
    const results = selectedVoucherData.map((voucher) => {
      // Simulate success/failure
      const emailSuccess = Math.random() > 0.1; // 90% success rate
      const smsSuccess = Math.random() > 0.15; // 85% success rate

      return {
        customerId: voucher.id,
        customerName: voucher.assigneeName,
        email: voucher.email,
        phone: voucher.phone,
        emailStatus: emailSuccess ? "success" : "failed",
        smsStatus: smsSuccess ? "success" : "failed",
        errorMessage:
          !emailSuccess || !smsSuccess ? "Network timeout" : undefined,
      };
    });

    // Log the message
    const messageLog = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientCount: results.length,
      subject: data.subject,
      emailMessage: data.emailMessage,
      smsMessage: data.smsMessage,
      template: data.template,
      results,
    };

    // Save to localStorage
    const existingLogs = JSON.parse(
      localStorage.getItem("message-logs") || "[]",
    );
    localStorage.setItem(
      "message-logs",
      JSON.stringify([messageLog, ...existingLogs]),
    );

    // Show results
    // setSendResults(results);
    setMessageComposerOpen(false);
    setSendResultsOpen(true);

    // Clear selection
    setSelectedVouchers(new Set());

    toast.success(
      `Messages sent to ${results.length} customer${results.length !== 1 ? "s" : ""}`,
    );
  };

  const handleSendVouchers = () => {
    const selectedVoucherData = filteredVouchers.filter((v) =>
      selectedVouchers.has(v.id),
    );

    // Simulate re-sending vouchers via email
    toast.success(
      `Re-sent ${selectedVoucherData.length} voucher${selectedVoucherData.length !== 1 ? "s" : ""} via email`,
    );

    // Clear selection
    setSelectedVouchers(new Set());
  };

  return (
    <div className={`flex-1 flex flex-col transition-all duration-300`}>
      {/* Fixed Header Section */}
      <div className={`sticky top-0 z-10 border-b transition-colors `}>
        {/* Page Title and Actions */}
        <div
          className={`px-6 py-4 border-b transition-colors ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <PageHeader
            title={t("vouchers_management")}
            description={t("create_track_manage_vouchers")}
            btnLabel={t("add_voucher")}
            h1Gradient={textPrimary}
            onClick={onAddVoucher}
            totalCount={totalData || 0}
          />
        </div>

        {/* Statistics Cards */}
        <div className="px-6 py-4 border-b transition-colors dark:border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: t("total_vouchers"),
                value: stats.total,
                from: "blue-50",
                to: "blue-100",
                text: "blue",
                border: "blue",
              },
              {
                label: t("assigned"),
                value: stats.assigned,
                from: "purple-50",
                to: "purple-100",
                text: "purple",
                border: "purple",
              },
              {
                label: t("redeemed"),
                value: stats.redeemed,
                from: "green-50",
                to: "green-100",
                text: "green",
                border: "green",
              },
              {
                label: t("remaining_balance"),
                value: stats.totalBalance.toLocaleString(),
                from: "orange-50",
                to: "orange-100",
                text: "orange",
                border: "orange",
              },
              {
                label: t("expired"),
                value: stats.expired,
                from: "gray-50",
                to: "gray-100",
                text: "gray",
                border: "gray",
              },
              {
                label: t("revenue"),
                value: stats.revenue.toLocaleString(),
                from: "teal-50",
                to: "teal-100",
                text: "teal",
                border: "teal",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`bg-linear-to-br from-${card.from} to-${card.to} dark:from-${card.text}-900/20 dark:to-${card.text}-800/20 rounded-lg p-4 border transition-colors ${isDark ? `border-${card.border}-800` : `border-${card.border}-200`}`}
              >
                <div
                  className={`text-sm mb-1 ${isDark ? `text-${card.text}-400` : `text-${card.text}-600`}`}
                >
                  {t(card.label)}
                </div>
                <div
                  className={`text-2xl ${isDark ? `text-${card.text}-100` : `text-${card.text}-900`}`}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b transition-colors dark:border-gray-800">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-[50vh]">
              <SearchInput
                placeholder={t("search_voucher_placeholder")}
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterButton value={showFilters} onChange={setShowFilters} />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div
            className={`px-6 py-4 border-b transition-colors ${isDark ? "bg-gray-800/50 border-gray-800" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label
                  className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("status")}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <option value="all">{t("all_statuses")}</option>
                  <option value="active">{t("active")}</option>
                  <option value="assigned">{t("assigned")}</option>
                  <option value="redeemed">{t("redeemed")}</option>
                  <option value="expired">{t("expired")}</option>
                  <option value="cancelled">{t("cancelled")}</option>
                </select>
              </div>

              {/* Campaign Filter */}
              <div>
                <label
                  className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("campaign")}
                </label>
                <select
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <option value="all">{t("all_campaigns")}</option>
                  {campaigns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Website Filter */}
              <div>
                <label
                  className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("website")}
                </label>
                <select
                  value={websiteFilter}
                  onChange={(e) => setWebsiteFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <option value="all">{t("all_websites")}</option>
                  {websites.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label
                  className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("amount_range")}
                </label>
                <div className="space-y-2">
                  <div className="relative pt-1">
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
                    className={`w-1/2 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={`w-1/2 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
              </div>

              {/* Creator Search */}
              <div>
                <label
                  className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("creator_search")}
                </label>
                <input
                  type="text"
                  value={creatorSearch}
                  onChange={(e) => setCreatorSearch(e.target.value)}
                  placeholder={t("creator_name_placeholder")}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                />
              </div>
            </div>

            {/* Clear All Filters Button */}
            {(statusFilter !== "all" ||
              campaignFilter !== "all" ||
              websiteFilter !== "all" ||
              searchQuery ||
              minAmount !== amountRange.min ||
              maxAmount !== amountRange.max ||
              dateFrom ||
              dateTo ||
              creatorSearch) && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setCampaignFilter("all");
                    setWebsiteFilter("all");
                    setSearchQuery("");
                    setMinAmount(amountRange.min);
                    setMaxAmount(amountRange.max);
                    setDateFrom("");
                    setDateTo("");
                    setCreatorSearch("");
                  }}
                  className={`text-sm flex items-center gap-1 transition-colors ${isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`}
                >
                  <X className="w-4 h-4" />
                  {t("clear_all_filters")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedVouchers.size > 0 && (
          <div
            className={`px-6 py-3 transition-colors border-b ${isDark ? "bg-teal-900/20 border-teal-800" : "bg-teal-50 border-teal-200"}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${isDark ? "text-teal-100" : "text-teal-900"}`}
              >
                {selectedVouchers.size} {t("voucher")}
                {selectedVouchers.size !== 1 ? t("plural_s") : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <span>{t("actions")}</span>
                  {showBulkActions ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedVouchers(new Set())}
                  className={`p-1.5 rounded transition-colors ${isDark ? "text-teal-400 hover:bg-teal-900/30" : "text-teal-600 hover:bg-teal-100"}`}
                  title={t("clear_selection")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showBulkActions && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${isDark ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                  onClick={() => setMessageComposerOpen(true)}
                >
                  <MessageSquare className="w-4 h-4" /> {t("send_message")}
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${isDark ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                  onClick={handleSendVouchers}
                >
                  <Send className="w-4 h-4" /> {t("re_send_vouchers")}
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${isDark ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  <Calendar className="w-4 h-4" /> {t("extend_expiration")}
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${isDark ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  <RefreshCw className="w-4 h-4" /> {t("change_status")}
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${isDark ? "text-red-400 border-red-700 hover:bg-red-900/20" : "text-red-600 border-red-300 hover:bg-red-50"}`}
                >
                  <XCircle className="w-4 h-4" /> {t("cancel_vouchers")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Table Content */}
      <div className="flex flex-col overflow-hidden h-[calc(100vh-450px)] mt-3">
        <div className="sticky">
          <ReordableDataTable
            rowKey="_id"
            data={allVouchers}
            isDataLoading={isLoading}
            selectedItems={selectedVouchers}
            onSelectionChange={setSelectedVouchers}
            onRowClick={(voucher) => onVoucherClick(voucher)}
            storageKey="vouchersTableColumnOrder"
            columns={columns}
            t={t}
          />
        </div>

        {filteredVouchers.length === 0 && (
          <div className="text-center py-12">
            <p
              className={`text-gray-500 ${isDark ? "dark:text-gray-400" : ""}`}
            >
              {t("no_vouchers_found")}
            </p>
          </div>
        )}
      </div>

      {/* Message Composer Modal */}
      <MessageComposerModal
        isOpen={messageComposerOpen}
        onClose={() => setMessageComposerOpen(false)}
        recipientCount={selectedVouchers.size}
        onSend={handleSendMessage}
        theme={theme}
      />

      {/* Send Results Modal */}
      <SendResultsModal
        isOpen={sendResultsOpen}
        onClose={() => setSendResultsOpen(false)}
        results={sendResults}
        theme={theme}
      />
    </div>
  );
}
