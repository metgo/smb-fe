import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetPaymentTransactionsQuery } from "@/store/api/paymentQueryApi";
import type { PaymentTransaction } from "@/store/api/paymentQueryApi";
import { PageHeader, SearchInput, ReordableDataTable } from "@/components/shared";
import EmptyState from "@/components/shared/EmptyState";
import { FilterButton } from "@/components/btns";
import FilterSelect from "@/pages/orders-mgmt/components/FilterSelect";
import { formatDateTime } from "@/helpers/formatter";
import InvoicePdfModal from "./components/InvoicePdfModal";

const LIMIT = 20;

const PAYMENT_STATUS_OPTIONS = [
  "SUCCESS",
  "FAILURE",
  "PENDING",
  "CANCELING",
  "REFUND_IN_PROCESS",
  "REFUND_SUCCESS",
  "UNPAID",
];

const ORDER_STATUS_OPTIONS = [
  "pending",
  "processing",
  "completed",
  "shipped",
  "canceled",
];

const DEFAULT_FILTERS = {
  paymentStatus: "all",
  orderStatus: "all",
};

const PaymentTransactionsPage = () => {
  const { t } = useTranslation("payments");
  const navigate = useNavigate();
  const { isDark, language, bgPrimary, textTertiary } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<PaymentTransaction[]>(
    [],
  );

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, limit: LIMIT };
    if (search.trim()) params.search = search.trim();
    if (filters.paymentStatus !== "all")
      params.paymentStatus = filters.paymentStatus;
    if (filters.orderStatus !== "all") params.orderStatus = filters.orderStatus;
    return params;
  }, [page, search, filters]);

  const { data, isFetching, isLoading } = useGetPaymentTransactionsQuery(
    queryParams,
    { refetchOnMountOrArgChange: true },
  );

  const totalData = data?.totalData ?? data?.meta?.total ?? 0;
  const fetchedPage = data?.meta?.page ?? page;
  const hasMore =
    data?.meta?.hasNextPage ??
    (data?.data?.length ? data.data.length === LIMIT : false);

  // Reset pagination whenever the query inputs change.
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  // Merge paginated pages, de-duping on `_id`.
  useEffect(() => {
    if (!data) return;

    const rows = data.data ?? [];

    if (fetchedPage === 1) {
      setAllTransactions(rows);
      return;
    }

    setAllTransactions((prev) => {
      const existing = new Set(prev.map((r) => r._id));
      return [...prev, ...rows.filter((r) => !existing.has(r._id))];
    });
  }, [data, fetchedPage]);

  const fetchNextPage = useCallback(() => {
    if (isFetching || !hasMore) return;
    setPage((prev) => prev + 1);
  }, [isFetching, hasMore]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.paymentStatus !== "all") count += 1;
    if (filters.orderStatus !== "all") count += 1;
    return count;
  }, [filters]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-xs text-gray-500">-</span>;

    const key = status.toLowerCase();

    const emerald = isDark
      ? "bg-emerald-900/30 text-emerald-400"
      : "bg-emerald-100 text-emerald-800";
    const blue = isDark
      ? "bg-blue-900/30 text-blue-400"
      : "bg-blue-100 text-blue-800";
    const orange = isDark
      ? "bg-orange-900/30 text-orange-400"
      : "bg-orange-100 text-orange-800";
    const red = isDark
      ? "bg-red-900/30 text-red-400"
      : "bg-red-100 text-red-800";
    const gray = isDark
      ? "bg-gray-800 text-gray-300"
      : "bg-gray-200 text-gray-700";

    const map: Record<string, string> = {
      // payment statuses
      success: emerald,
      refund_success: blue,
      refund_in_process: blue,
      pending: orange,
      canceling: orange,
      unpaid: gray,
      failure: red,
      // order statuses
      completed: emerald,
      shipped: emerald,
      paid: emerald,
      processing: blue,
      canceled: red,
    };

    const cls =
      map[key] ??
      (isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700");

    const label = t(key, { defaultValue: status });

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{label}</span>
    );
  };

  const columns = [
    {
      key: "customer",
      label: t("customer"),
      render: (row: PaymentTransaction) => {
        const { firstName, lastName, email, countryCode, phone } =
          row.userInfo ?? {};
        const name = [firstName, lastName].filter(Boolean).join(" ").trim();
        const phoneText = phone
          ? `${countryCode ? `+${countryCode} ` : ""}${phone}`
          : "";
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{name || t("guest")}</span>
            {email && (
              <span className="text-xs text-gray-500">{email}</span>
            )}
            {phoneText && (
              <span className="text-xs text-gray-500" dir="ltr">
                {phoneText}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "orderId",
      label: t("order_id"),
      render: (row: PaymentTransaction) =>
        row.orderId ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${routes.ordersMgmt}?orderId=${row.orderId}`);
            }}
            className="cursor-pointer text-xs font-mono text-teal-500 hover:text-teal-400 hover:underline truncate max-w-[180px]"
            title={row.orderId}
          >
            {row.orderId}
          </button>
        ) : (
          <span className="text-xs text-gray-500">-</span>
        ),
    },
    {
      key: "amount",
      label: t("amount"),
      sortable: true,
      render: (row: PaymentTransaction) => {
        const value = Number(row.amount);
        const formatted = Number.isNaN(value)
          ? "-"
          : new Intl.NumberFormat(language === "he" ? "he-IL" : "en-US", {
              style: "currency",
              currency: row.currency || "ILS",
              maximumFractionDigits: 2,
            }).format(value);
        return <span className="text-sm font-medium">{formatted}</span>;
      },
    },
    {
      key: "method",
      label: t("payment_method"),
      render: (row: PaymentTransaction) => (
        <span className="text-sm capitalize">{row.method || "-"}</span>
      ),
    },
    {
      key: "invoiceUrl",
      label: t("invoice"),
      render: (row: PaymentTransaction) =>
        row.invoiceUrl ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInvoiceUrl(row.invoiceUrl as string);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-teal-500 hover:text-teal-400 hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            {t("view_invoice")}
          </button>
        ) : (
          <span className="text-xs text-gray-500">-</span>
        ),
    },
    {
      key: "paymentStatus",
      label: t("payment_status"),
      render: (row: PaymentTransaction) => getStatusBadge(row.paymentStatus),
    },
    {
      key: "orderStatus",
      label: t("order_status"),
      render: (row: PaymentTransaction) => getStatusBadge(row.orderStatus),
    },
    {
      key: "paymentDate",
      label: t("payment_date"),
      sortable: true,
      render: (row: PaymentTransaction) => (
        <span className="text-sm whitespace-nowrap">
          {row.paymentDate ? formatDateTime(row.paymentDate, language) : "-"}
        </span>
      ),
    },
  ];

  const isInitialLoad =
    (isLoading || isFetching) && page === 1 && allTransactions.length === 0;
  const isRefreshing =
    isFetching && page === 1 && allTransactions.length > 0;

  return (
    <div
      className={`h-[calc(100vh-7rem)] flex flex-col overflow-hidden rounded-2xl px-2 pt-10 md:pt-0 ${bgPrimary}`}
    >
      <div className="shrink-0">
        <PageHeader
          title={t("payment_transactions")}
          description={t("payment_transactions_desc")}
          h1Gradient="text-transparent bg-gradient-to-r from-teal-500 to-cyan-400"
          totalCount={totalData || undefined}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
          <div className="flex-1 relative">
            <SearchInput
              placeholder={t("search_placeholder")}
              searchTerm={search}
              setSearchTerm={setSearch}
              storageKey="paymentTransactionsSearchTerm"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <div className="relative">
              <FilterButton value={showFilters} onChange={setShowFilters} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none bg-teal-500 text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {showFilters && (
          <div
            className={`flex flex-wrap items-end gap-4 mt-3 pt-3 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="min-w-45">
              <FilterSelect
                label={t("payment_status")}
                value={filters.paymentStatus}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, paymentStatus: value }))
                }
                options={[
                  { value: "all", label: t("all") },
                  ...PAYMENT_STATUS_OPTIONS.map((value) => ({
                    value,
                    label: t(value.toLowerCase(), { defaultValue: value }),
                  })),
                ]}
              />
            </div>

            <div className="min-w-45">
              <FilterSelect
                label={t("order_status")}
                value={filters.orderStatus}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, orderStatus: value }))
                }
                options={[
                  { value: "all", label: t("all") },
                  ...ORDER_STATUS_OPTIONS.map((value) => ({
                    value,
                    label: t(value, { defaultValue: value }),
                  })),
                ]}
              />
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
              >
                {t("clear_all")}
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex-1 min-h-0 mt-4 transition-opacity duration-200 ${
          isRefreshing ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {!isInitialLoad && allTransactions.length === 0 ? (
          <EmptyState searchQuery={search} />
        ) : (
          <ReordableDataTable
            rowKey="_id"
            data={allTransactions}
            columns={columns}
            storageKey="paymentTransactionsTableColumnOrder"
            isDataLoading={isInitialLoad}
            hasMore={hasMore}
            next={fetchNextPage}
          />
        )}

        {allTransactions.length > 0 && !hasMore && (
          <p className={`text-center text-xs py-4 ${textTertiary}`}>
            {`${allTransactions.length} ${t("transactions_list")}`}
          </p>
        )}
      </div>

      {invoiceUrl && (
        <InvoicePdfModal
          url={invoiceUrl}
          title={t("invoice")}
          onClose={() => setInvoiceUrl(null)}
        />
      )}
    </div>
  );
};

export default PaymentTransactionsPage;
