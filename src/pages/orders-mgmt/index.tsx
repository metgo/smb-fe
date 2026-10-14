import clsx from "clsx";
import UserStatsCards from "@/components/shared/UserStatsCards";
import { Activity } from "react";

import {
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Camera,
  ShoppingCart,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FilterButton } from "@/components/btns";
import {
  BulkActionBar,
  ConfirmDialog,
  OrderGridView,
  OrderListView,
  ShowColumns,
  ViewModeToggle,
} from "@/components/shared";
import {
  FilterSelect,
  MonthFilter,
  OrderDetailsModal,
  QRScannerModal,
  ExportOrdersButton,
} from "./components";
import SearchInput from "@/components/shared/SearchInput";
import AmountFilter from "@/components/shared/AmountFilter";
import StatsMarquee from "@/components/shared/StatsMarquee";
import { formatDateTime, formatILS } from "@/helpers/formatter";
import { displayPaymentStatus } from "@/helpers";
import { ORDER_COLUMNS } from "@/lib/utils";
import {
  useOrdersMgmt,
  PAYMENT_STATUS_FILTER_OPTIONS,
  ITEM_TYPE_FILTER_OPTIONS,
} from "./hooks/useOrdersMgmt";

const { columnDefinitions } = ORDER_COLUMNS;

export default function OrdersMgmtPage() {
  const { isDark, isRTL, language } = useThemeClasses();

  const {
    t,
    tc,
    isQRMode,
    qrSessionReady,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    defaultFilters,
    activeFilterChips,
    showFilters,
    setShowFilters,
    selectedOrders,
    setSelectedOrders,
    showColumnSettings,
    setShowColumnSettings,
    columnVisibility,
    setColumnVisibility,
    viewMode,
    setViewMode,
    showOrderDetails,
    setShowOrderDetails,
    selectedOrder,
    handleRowClick,
    showQRScanner,
    stream,
    getVideoStream,
    stopCamera,
    canViewOrders,
    combinedOrders,
    websiteMap,
    orderStat,
    isStatsLoading,
    isLoading,
    isFetching,
    refetch,
    hasMore,
    totalData,
    fetchNextPage,
    qrToken,
    isConfirmOpen,
    setIsConfirmOpen,
    isBulkDelete,
    setIsBulkDelete,
    pendingRecipient,
    setPendingRecipient,
    promptBulkResend,
    handleBulkResend,
  } = useOrdersMgmt();

  const columns = [
    { key: "checkbox", label: "", width: "50px" },

    columnVisibility.productCount && {
      key: "productCount",
      label: t("productCount"),
      sortable: true,
      render: (order: any) => (
        <div className="text-sm">{order?.productCount ?? "-"}</div>
      ),
    },
    columnVisibility.totalOrderAmount && {
      key: "totalOrderAmount",
      label: t("totalOrderAmount"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm font-medium">
          {order?.totalAmount != null
            ? `₪${order.totalAmount.toLocaleString()}`
            : "-"}
        </div>
      ),
    },
    columnVisibility.deliveryFee && {
      key: "deliveryFee",
      label: t("deliveryFee"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm font-medium">
          {order?.deliveryFee != null
            ? `₪${order.deliveryFee.toLocaleString()}`
            : "-"}
        </div>
      ),
    },
    columnVisibility.status && {
      key: "status",
      label: t("order_status"),
      render: (order: IOrder) => getOrderStatusBadge(order.status),
    },
    columnVisibility.paymentStatus && {
      key: "paymentStatus",
      label: t("paymentStatus"),
      render: (order: IOrder) =>
        getPaymentStatusBadge(
          displayPaymentStatus(
            order.paymentStatus,
            order.status,
          ) as TPaymentStatus,
        ),
    },
    columnVisibility.paymentMethod && {
      key: "paymentMethod",
      label: t("paymentMethod"),
      render: (order: IOrder) => (
        <div className="text-sm">
          {Array.isArray(order.paymentMethod) && order.paymentMethod.length > 0
            ? order.paymentMethod.map((m) => t(m)).join(", ")
            : order.paymentMethod || "-"}
        </div>
      ),
    },
    columnVisibility.createdAt && {
      key: "createdAt",
      label: t("created_date"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm text-gray-500">
          {formatDateTime(order?.createdAt, language)}
        </div>
      ),
    },

    columnVisibility._id && {
      key: "_id",
      label: t("_id"),
      sortable: true,
      render: (order: any) => (
        <div className="text-sm">{order?._id ?? "-"}</div>
      ),
    },

    columnVisibility.name && {
      key: "name",
      label: t("purchaser_name_field"),
      sortable: true,
      render: (order: IOrder) => <div className="text-sm">{order?.name}</div>,
    },

    columnVisibility.email && {
      key: "email",
      label: t("purchaser_email"),
      render: (order: IOrder) => (
        <a
          href={`mailto:${order?.email}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
        >
          <Mail className="w-3 h-3" />
          {order?.email}
        </a>
      ),
    },

    columnVisibility.phone && {
      key: "phone",
      label: t("purchaser_phone"),
      render: (order: IOrder) => (
        <a
          href={`tel:${order?.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
        >
          <Phone className="w-3 h-3" />
          {order?.phone ? order.phone : "-"}
        </a>
      ),
    },
    columnVisibility.website && {
      key: "website",
      label: t("website"),
      render: (order: IOrder) => {
        const website = websiteMap[order.externalApiId ?? ""];
        if (!website) return <span className="text-sm text-gray-400">-</span>;
        return (
          <div className="flex items-center gap-1.5">
            {website.logoUrl && (
              <img
                src={website.logoUrl}
                alt={website.websiteName}
                className="w-5 h-5 object-contain rounded"
              />
            )}
            <span className="text-sm">{website.websiteName}</span>
          </div>
        );
      },
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: IOrder) => React.ReactNode;
  }[];

  const orderStats = [
    {
      id: 1,
      title: t("totalOrders"),
      value: orderStat?.totalOrders?.toLocaleString(),
      label: t("all"),
      icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 2,
      title: t("revenue"),
      value: formatILS(orderStat?.totalRevenue),
      label: t("gross"),
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
    },
    {
      id: 3,
      title: t("avgOrderValue"),
      value: `₪${Math.round(orderStat?.avgOrderValue).toLocaleString()}`,
      label: t("perOrder"),
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 4,
      title: t("pickups"),
      value: orderStat?.totalPickups?.toLocaleString(),
      label: t("orders"),
      icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
    },
    {
      id: 5,
      title: t("deliveries"),
      value: orderStat?.totalDeliveries?.toLocaleString(),
      label: t("orders"),
      icon: <Truck className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 6,
      title: t("cancelledOrders"),
      value: orderStat?.totalCanceledOrders?.toLocaleString(),
      label: t("cancelled"),
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
  ];

  function getPaymentStatusBadge(status: TPaymentStatus) {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        PENDING: {
          bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
          text: isDark ? "text-orange-400" : "text-orange-800",
          label: t("pending"),
        },
        SUCCESS: {
          bg: isDark ? "bg-emerald-900/30" : "bg-emerald-100",
          text: isDark ? "text-emerald-400" : "text-emerald-800",
          label: t("success"),
        },
        FAILURE: {
          bg: isDark ? "bg-red-900/30" : "bg-red-100",
          text: isDark ? "text-red-400" : "text-red-800",
          label: t("failed"),
        },
        FAILED: {
          bg: isDark ? "bg-red-900/30" : "bg-red-100",
          text: isDark ? "text-red-400" : "text-red-800",
          label: t("failed"),
        },
        REFUNDED: {
          bg: isDark ? "bg-blue-900/30" : "bg-blue-100",
          text: isDark ? "text-blue-400" : "text-blue-800",
          label: t("refunded"),
        },
        REFUND_IN_PROCESS: {
          bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
          text: isDark ? "text-orange-400" : "text-orange-800",
          label: t("refund_in_process"),
        },
        PARTIALLY_REFUNDED: {
          bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
          text: isDark ? "text-orange-400" : "text-orange-800",
          label: t("partially_refunded"),
        },
      };
    const badge = badges[status];
    if (!badge)
      return <span className="text-xs text-gray-500">{status ?? "-"}</span>;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  }

  function getOrderStatusBadge(status: IOrder["status"]) {
    const badges = {
      pending: {
        bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
        text: isDark ? "text-orange-400" : "text-orange-800",
        label: t("pending"),
      },
      processing: {
        bg: isDark ? "bg-blue-900/30" : "bg-blue-100",
        text: isDark ? "text-blue-400" : "text-blue-800",
        label: t("processing"),
      },
      completed: {
        bg: isDark ? "bg-emerald-900/30" : "bg-emerald-100",
        text: isDark ? "text-emerald-400" : "text-emerald-800",
        label: t("completed"),
      },
      shipped: {
        bg: isDark ? "bg-emerald-900/30" : "bg-emerald-100",
        text: isDark ? "text-emerald-400" : "text-emerald-800",
        label: t("shipped"),
      },
      canceled: {
        bg: isDark ? "bg-red-900/30" : "bg-red-100",
        text: isDark ? "text-red-400" : "text-red-800",
        label: t("cancelled"),
      },
      draft: {
        bg: isDark ? "bg-gray-800" : "bg-gray-100",
        text: isDark ? "text-gray-300" : "text-gray-800",
        label: t("draft"),
      },
      paid: {
        bg: isDark ? "bg-green-900/30" : "bg-green-100",
        text: isDark ? "text-green-400" : "text-green-800",
        label: t("paid"),
      },
      confirmed: {
        bg: isDark ? "bg-teal-900/30" : "bg-teal-100",
        text: isDark ? "text-teal-400" : "text-teal-800",
        label: t("confirmed"),
      },
      delivered: {
        bg: isDark ? "bg-purple-900/30" : "bg-purple-100",
        text: isDark ? "text-purple-400" : "text-purple-800",
        label: t("delivered"),
      },
      partially_cancelled: {
        bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
        text: isDark ? "text-orange-400" : "text-orange-800",
        label: t("partiallyCancelled"),
      },
      failed: {
        bg: isDark ? "bg-red-900/30" : "bg-red-100",
        text: isDark ? "text-red-400" : "text-red-800",
        label: t("failed"),
      },
    };
    const badge = badges[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}
      >
        {badge?.label}
      </span>
    );
  }

  return (
    <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
      {/* Sticky Top Header Bar (Title + Count + Camera/Filter Toggle + Stats) */}
      <div
        className={clsx(
          "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
          isDark
            ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          isRTL && "xl:flex-row-reverse",
        )}
      >
        {/* Left: Title + Order Count (Top), Description (Below) */}
        <div className="flex flex-col items-start gap-1 shrink-0 min-w-0">
          <div
            className={clsx(
              "flex items-center w-full justify-between gap-2",
              isRTL && "flex-row-reverse",
            )}
          >
            <div
              className={clsx(
                "flex items-center gap-1",
                isRTL && "flex-row-reverse",
              )}
            >
              <h1 className="text-base md:text-lg font-bold bg-clip-text bg-linear-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600 whitespace-nowrap">
                {t("online_orders_management")}
              </h1>
              {totalData !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  {totalData}
                </span>
              )}
            </div>

            <div
              className={clsx(
                "flex items-center gap-2 shrink-0",
                isRTL && "flex-row-reverse",
              )}
            >
              {canViewOrders && (
                <button
                  onClick={getVideoStream}
                  className={clsx(
                    "p-2 rounded-xl border transition-colors cursor-pointer",
                    isDark
                      ? "border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-300"
                      : "border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-700",
                  )}
                  title={t("scan_qr") ?? "Scan QR"}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p
            className={clsx(
              "text-xs whitespace-nowrap",
              isDark ? "text-gray-500" : "text-gray-500",
            )}
          >
            {t("online_orders_subtitle")}
          </p>
        </div>

        {/* Right: Horizontal Scrollable Stats Cards Row */}
        <div
          dir="ltr"
          className="flex-1 min-w-0 flex flex-row items-center gap-2 overflow-x-auto flex-nowrap py-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {canViewOrders ? (
            <StatsMarquee
              stats={orderStats}
              isLoading={isStatsLoading}
              className="flex-1 min-w-0"
            />
          ) : (
            <UserStatsCards stats={orderStats} isLoading={isStatsLoading} />
          )}
        </div>
      </div>

      {/* Search bar (always visible) + collapsible controls on the same row */}
      {canViewOrders && (
        <div
          className={clsx(
            "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div
            className={clsx(
              "flex flex-col lg:flex-row lg:items-center gap-3",
              isRTL && "lg:flex-row-reverse",
            )}
          >
            <div className="flex-1 min-w-0 relative" data-tour="search">
              <SearchInput
                placeholder={t("search_orders")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey="orderSearchTerm"
              />
            </div>

            <div
              className={clsx(
                "flex items-center justify-between gap-2 w-full lg:w-auto flex-wrap",
                isRTL && "flex-row-reverse",
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton value={showFilters} onChange={setShowFilters} />
                <ViewModeToggle
                  value={viewMode}
                  onChange={setViewMode}
                  tableName="ordersViewMode"
                />
                <ShowColumns
                  t={t}
                  viewMode={viewMode}
                  columnDefinitions={columnDefinitions}
                  columnVisibility={columnVisibility}
                  showColumnSettings={showColumnSettings}
                  setShowColumnSettings={setShowColumnSettings}
                  setColumnVisibility={setColumnVisibility}
                  resetToDefault={() =>
                    setColumnVisibility(ORDER_COLUMNS.defaultColumns)
                  }
                />
                <ExportOrdersButton
                  orders={combinedOrders}
                  selectedOrders={selectedOrders}
                  columnVisibility={columnVisibility}
                  websiteMap={websiteMap}
                  isSummaryMode={false}
                  summaryData={[]}
                  t={t}
                  tc={tc}
                  monthFilter={filters.month}
                  customDateFrom={filters.startDate}
                  customDateTo={filters.endDate}
                />
              </div>
            </div>
          </div>

          {showFilters && (
            <div
              className={`flex flex-wrap items-start gap-4 pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
            >
              <div className="min-w-45">
                <FilterSelect
                  label={t("status")}
                  value={filters.status}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                  options={[
                    { value: "all", label: t("all") },
                    { value: "pending", label: t("pending") },
                    { value: "processing", label: t("processing") },
                    { value: "completed", label: t("completed") },
                    { value: "shipped", label: t("shipped") },
                    { value: "canceled", label: t("canceled") },
                  ]}
                />
              </div>

              <div className="min-w-55">
                <MonthFilter
                  label={t("month")}
                  value={filters.month}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, month: value }))
                  }
                  dateFrom={filters.startDate}
                  dateTo={filters.endDate}
                  onDateFromChange={(value) =>
                    setFilters((prev) => ({ ...prev, startDate: value }))
                  }
                  onDateToChange={(value) =>
                    setFilters((prev) => ({ ...prev, endDate: value }))
                  }
                  t={t}
                />
              </div>

              <>
                <div className="min-w-45">
                  <FilterSelect
                    label={t("deliveryType")}
                    value={filters.deliveryType}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        deliveryType: value,
                      }))
                    }
                    options={[
                      { value: "all", label: t("all") },
                      { value: "pick_up", label: t("pickups") },
                      { value: "deliver", label: t("delivery") },
                    ]}
                  />
                </div>

                <div className="min-w-45">
                  <FilterSelect
                    label={t("itemType")}
                    value={filters.itemType ?? "all"}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        itemType: value,
                      }))
                    }
                    options={[
                      { value: "all", label: t("all") },
                      ...ITEM_TYPE_FILTER_OPTIONS.map((o) => ({
                        value: o.value,
                        label: t(o.labelKey),
                      })),
                    ]}
                  />
                </div>

                <div className="min-w-45">
                  <FilterSelect
                    label={t("paymentMethod")}
                    value={filters.paymentMethod}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                    options={[
                      { value: "all", label: t("all") },
                      { value: "voucher", label: t("voucher") },
                      { value: "card", label: t("creditCard") },
                    ]}
                  />
                </div>

                <div className="min-w-45">
                  <FilterSelect
                    label={t("paymentStatus")}
                    value={filters.paymentStatus}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        paymentStatus: value,
                      }))
                    }
                    options={[
                      { value: "all", label: t("all") },
                      ...PAYMENT_STATUS_FILTER_OPTIONS.map((o) => ({
                        value: o.value,
                        label: t(o.labelKey),
                      })),
                    ]}
                  />
                </div>

                <div className="min-w-45">
                  <AmountFilter
                    value={filters.amount}
                    onChange={(amount) =>
                      setFilters((prev) => ({ ...prev, amount }))
                    }
                  />
                </div>

                {/* Clear-all button at the end of the filter fields */}
                {(activeFilterChips?.length > 0 || searchTerm) && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilters(defaultFilters);
                        setSearchTerm("");
                      }}
                      className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                    >
                      {t("clear_all")}
                    </button>
                  </div>
                )}
              </>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        <div>
          {selectedOrders.size > 0 && (
            <BulkActionBar
              selectedItemCount={selectedOrders.size}
              handleResendToVendor={() => promptBulkResend("VENDOR")}
              handleResendToCustomer={() => promptBulkResend("CUSTOMER")}
              hancleClearSelection={() => setSelectedOrders(new Set())}
            />
          )}
        </div>

        {/* Orders Table */}
        {canViewOrders && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div
              className={`${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
            >
              {viewMode === "list" ? (
                <OrderListView
                  isLoading={isLoading || isFetching}
                  storageKey="ordersTableColumnOrder"
                  hasMore={hasMore}
                  combinedOrders={combinedOrders}
                  fetchNextPage={fetchNextPage}
                  selectedOrders={selectedOrders}
                  setSelectedOrders={setSelectedOrders}
                  handleRowClick={handleRowClick}
                  columns={columns}
                />
              ) : (
                <OrderGridView
                  data={combinedOrders}
                  columns={columns}
                  onRowClick={handleRowClick}
                  next={fetchNextPage}
                  hasMore={hasMore}
                  isLoading={isLoading || isFetching}
                  t={t}
                  selectedOrders={selectedOrders}
                  setSelectedOrders={setSelectedOrders}
                />
              )}
            </div>
          </div>
        )}
      </div>
      {/* end flex-1 */}

      {selectedOrder && showOrderDetails && (
        <OrderDetailsModal
          t={t}
          orderId={selectedOrder._id}
          onClose={() => {
            setShowOrderDetails(false);
            refetch();
          }}
          qrToken={isQRMode && !qrSessionReady ? qrToken : null}
          isQRMode={isQRMode && !qrSessionReady}
        />
      )}

      <Activity mode={showQRScanner ? "visible" : "hidden"}>
        <QRScannerModal stream={stream} onClose={stopCamera} />
      </Activity>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("resend_notification")}
        confirmText={t("resend")}
        variant="info"
        onCancel={() => {
          setIsConfirmOpen(false);
          setIsBulkDelete(false);
        }}
        onConfirm={() => {
          if (pendingRecipient && isBulkDelete) {
            handleBulkResend(pendingRecipient);
          }
          setIsConfirmOpen(false);
          setPendingRecipient(null);
        }}
      />
    </div>
  );
}
