import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  ArrowLeft,
  Landmark,
  ShoppingCart,
  DollarSign,
  Wallet,
  Users,
  Percent,
  Truck,
  SlidersHorizontal,
} from "lucide-react";
import {
  AdminDisputeResponseModal,
  CancelOrderModal,
  CloseAllOrdersModal,
  DisputeModal,
  OrderDetailsModal,
  VendorMonthlySummaryCards,
  ExportOrdersButton,
  VendorBankDetails,
} from "./components";
import clsx from "clsx";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllWebsitesQuery } from "@/store/api/websiteConfigApi";
import type { VendorPaymentSummaryRow } from "@/store/api/reconciliationQueryApi";
import SearchInput from "@/components/shared/SearchInput";
import { ReordableDataTable, ConfirmDialog } from "@/components/shared";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import MonthFilter from "@/pages/orders-mgmt/components/MonthFilter";
import FilterButton from "@/components/btns/FilterButton";
import { useVendorMonthlyReportData } from "./hooks/useVendorMonthlyReportData";
import { useVendorPaymentSummaryData } from "./hooks/useVendorPaymentSummaryData";
import { useBusinessSearch } from "./hooks/useBusinessSearch";
import { useOrderStats } from "./hooks/useOrderStats";
import { useOrderActions } from "./hooks/useOrderActions";
import { mapOrderProductList, buildOrderColumns } from "./helpers";
import {
  formatMonthFilterLabel,
  getCurrentMonthFilterValue,
  getMonthFilterLocale,
} from "@/helpers";

export const PaymentMgmtPage = () => {
  const { t } = useTranslation("reconciliation");
  const { t: tc } = useTranslation("common");
  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    borderColor,
    textSecondary,
    textTertiary,
    isDark,
    language,
  } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);
  const adminView = userRole === "superadmin";

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    reconciliationStatus: "all",
    startDate: "",
    endDate: "",
    month: "all",
    businessId: "",
  });

  const [activeVendor, setActiveVendor] =
    useState<VendorPaymentSummaryRow | null>(null);

  const {
    businessSearch,
    businesses,
    showBusinessDropdown,
    setShowBusinessDropdown,
    isSearchingBusinesses,
    // selectedBusinessName,
    searchBusinesses,
    resetBusinessSearch,
    selectBusiness,
    setSelectedBusinessName,
  } = useBusinessSearch();

  const {
    combinedOrders,
    reconciliationStats,
    isLoading,
    isFetching,
    refetch,
    refetchStats: refetchReconciliationStats,
    scopeParams,
    hasMore,
    fetchNextPage,
    showVenderWiseOrderTable,
    setShowVendorWiseOrderTable,
  } = useVendorMonthlyReportData(filters, searchTerm);

  const {
    vendors: vendorSummaries,
    summaryOverview: vendorSummaryOverview,
    isLoading: isVendorSummaryLoading,
    isFetching: isVendorSummaryFetching,
    hasMore: hasMoreVendorSummaries,
    fetchNextPage: fetchNextVendorSummaryPage,
  } = useVendorPaymentSummaryData(
    {
      month: filters.month,
      startDate: filters.startDate,
      endDate: filters.endDate,
    },
    searchTerm,
    adminView,
  );

  const orders = useMemo(
    () => combinedOrders.map((d) => mapOrderProductList(d, language)),
    [combinedOrders, language],
  );

  const { data: allWebsites } = useGetAllWebsitesQuery();

  const websiteMap = useMemo(() => {
    if (!allWebsites) return {} as Record<string, any>;
    return allWebsites.reduce(
      (map, w) => {
        map[w._id] = w;
        return map;
      },
      {} as Record<string, any>,
    );
  }, [allWebsites]);

  // const handleClearAllFilters = () => {
  //   setFilters({
  //     status: "all",
  //     reconciliationStatus: "all",
  //     startDate: "",
  //     endDate: "",
  //     month: "all",
  //     businessId: "",
  //   });
  //   resetBusinessSearch();
  // };

  const handleViewVendorOrders = (vendor: VendorPaymentSummaryRow) => {
    setActiveVendor(vendor);
    setFilters((prev) => ({ ...prev, businessId: vendor.vendor_info._id }));
    setSelectedBusinessName(vendor.vendor_info.name || "-");
    setShowVendorWiseOrderTable(true);
  };

  const handleBackToVendorSummary = () => {
    setShowVendorWiseOrderTable(false);
    setActiveVendor(null);
    setFilters((prev) => ({ ...prev, businessId: "" }));
    resetBusinessSearch();
  };

  const stats = useOrderStats(reconciliationStats);

  const {
    selectedOrder,
    setSelectedOrder,
    showOrderDetails,
    setShowOrderDetails,
    showDisputeModal,
    setShowDisputeModal,
    isReopenDisputeFlow,
    setIsReopenDisputeFlow,
    showCancelModal,
    setShowCancelModal,
    showAdminDisputeModal,
    setShowAdminDisputeModal,
    showCloseAllOrdersModal,
    setShowCloseAllOrdersModal,
    showBulkCompleteConfirm,
    setShowBulkCompleteConfirm,
    reopenFetchingId,
    isDetailsLoading,
    isBulkCompleting,
    isClosingAllOrders,
    isFetchingSweepPreview,
    isSweepPreviewError,
    sweepPreviewErrorMessage,
    finalizeSweepPreview,
    displayedOrder,
    closeAllOrdersTargetMonthLabel,
    closeDetails,
    handleOpenDispute,
    handleReopenDispute,
    handleReopenFromRow,
    handleSubmitReopenDispute,
    handleSubmitDispute,
    handleCancelOrder,
    handleSubmitCancel,
    handleViewDetails,
    handleApproveDispute,
    handleAdminResolveDispute,
    handleBulkMarkOrderCompleted,
    handleCloseAllOrders,
    vendorBankDetails,
    showVendorBankDetailsModal,
    setShowVendorBankDetailsModal,
  } = useOrderActions({
    language,
    adminView,
    refetch,
    refetchReconciliationStats,
    scopeParams,
  });

  const columns = buildOrderColumns({
    t,
    userRole,
    adminView,
    language,
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    websiteMap,
    reopenFetchingId,
    onOpenDispute: handleOpenDispute,
    onReopenFromRow: handleReopenFromRow,
    onApproveDispute: handleApproveDispute,
    onCancelOrder: handleCancelOrder,
  });

  const orderStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total_orders"),
        value: stats.totalOrders,
        icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
      },
      {
        id: 2,
        title: t("total_revenue"),
        value: `₪${(stats.totalRevenue || 0).toLocaleString()}`,
        icon: <DollarSign className="w-5 h-5 text-green-500" />,
      },
      {
        id: 3,
        title: t("net_payout"),
        value: `₪${(stats.netPayout || 0).toLocaleString()}`,
        icon: <Wallet className="w-5 h-5 text-teal-500" />,
      },
      {
        id: 4,
        title: t("pending"),
        value: stats.pending,
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
      },
      {
        id: 5,
        title: t("approved"),
        value: stats.approved,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      },
      {
        id: 6,
        title: t("disputed"),
        value: stats.disputed,
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      },
      {
        id: 7,
        title: t("canceled"),
        value: stats.cancelled,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      },
    ],
    [stats, t],
  );

  const vendorSummaryStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total_vendors"),
        value: vendorSummaryOverview?.totalVendors,
        icon: <Users className="w-5 h-5 text-purple-500" />,
      },
      {
        id: 2,
        title: t("total_revenue"),
        value: `₪${(vendorSummaryOverview?.totalRevenue || 0).toLocaleString()}`,
        icon: <DollarSign className="w-5 h-5 text-green-500" />,
      },
      {
        id: 3,
        title: t("net_payout"),
        value: `₪${(vendorSummaryOverview?.totalNetPayment || 0).toLocaleString()}`,
        icon: <Wallet className="w-5 h-5 text-teal-500" />,
      },
      {
        id: 4,
        title: t("platform_fee"),
        value: `₪${(vendorSummaryOverview?.totalPlatformCharge || 0).toLocaleString()}`,
        icon: <Percent className="w-5 h-5 text-blue-500" />,
      },
      {
        id: 5,
        title: t("delivery_fee"),
        value: `₪${(vendorSummaryOverview?.totalDeliveryFee || 0).toLocaleString()}`,
        icon: <Truck className="w-5 h-5 text-orange-500" />,
      },
    ],
    [vendorSummaryOverview, t],
  );

  const showVendorSummaryStats = adminView && !showVenderWiseOrderTable;
  const headerStats = showVendorSummaryStats ? vendorSummaryStats : orderStats;

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
          ? (tc("close_options") ?? "Close Options")
          : (tc("search_and_filters") ?? "Search & Filters")
      }
    >
      <SlidersHorizontal className="w-4 h-4" />
    </button>
  );

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className={textSecondary}>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
      {/* Sticky Top Header Bar (Title + Count + Filter Toggle + Stats) */}
      <div
        className={clsx(
          "sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
          isDark
            ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
        )}
      >
        <ListHeaderBar
          title={tc("vendor_reconciliation")}
          stats={headerStats}
          isStatsLoading={
            showVendorSummaryStats ? isVendorSummaryLoading : isLoading
          }
          filterToggle={filterToggleButton}
        />
      </div>

      {/* Secondary row: month range, description & action buttons */}
      <div
        className={clsx(
          "flex flex-col md:flex-row md:items-center justify-between gap-2 px-1",
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold px-2 py-0.5 rounded-full ${bgSecondary} ${textSecondary}`}
          >
            {filters.month === "custom"
              ? filters.startDate && filters.endDate
                ? `${filters.startDate} - ${filters.endDate}`
                : t("customRange")
              : formatMonthFilterLabel(
                  filters.month === "all"
                    ? getCurrentMonthFilterValue()
                    : filters.month,
                  getMonthFilterLocale(language),
                )}
          </span>
          <p className={clsx("text-sm", textSecondary)}>
            {t("review_and_approve_orders")}
          </p>
        </div>
        {adminView ? (
          <button
            type="button"
            onClick={() => setShowCloseAllOrdersModal(true)}
            className="px-3 py-1.5 cursor-pointer rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            {t("close_all_orders")}
          </button>
        ) : (
          <div className="flex flex-col md:items-end gap-2">
            <button
              type="button"
              onClick={() => setShowVendorBankDetailsModal(true)}
              className="px-3 py-1.5 cursor-pointer rounded bg-green-600 hover:bg-green-700 text-white text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Landmark className="w-4 h-4" />
              {t("bank_details")}
            </button>
            {!vendorBankDetails?.bankAccount && (
              <span className={clsx("text-xs font-semibold text-red-500")}>
                {t("bank_details_incomplete_info")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expandable Search, Filters & Controls Panel */}
      {showControlsDrawer && (
        <div
          className={clsx(
            "transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="flex-1 w-full min-w-0">
              <SearchInput
                placeholder={t("search_by_order")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey="vendorReconSearchTerm"
              />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              {(stats.orderProductPending > 0 ||
                stats.orderProductProcessing > 0 ||
                stats.orderProductShipped > 0) && (
                <button
                  onClick={() => setShowBulkCompleteConfirm(true)}
                  className={clsx(
                    "px-4 py-2 rounded-lg cursor-pointer border transition-colors flex items-center gap-2",
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                      : "border-gray-300 hover:bg-gray-100 text-gray-600",
                  )}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden md:block">
                    {t("approve_pending_orders")}
                  </span>
                </button>
              )}

              <ExportOrdersButton
                t={t}
                vendorId={
                  activeVendor?.vendor_info._id || vendorBankDetails?.id || ""
                }
                vendorName={
                  activeVendor?.vendor_info.name ||
                  vendorBankDetails?.firstName ||
                  "-"
                }
                monthFilter={filters.month}
                customDateFrom={filters.startDate}
                customDateTo={filters.endDate}
              />
              <FilterButton value={showFilters} onChange={setShowFilters} />
            </div>
          </div>

          {showFilters && (
            <div
              className={`pt-4 border-t ${borderColor} grid grid-cols-1 md:grid-cols-4 gap-4`}
            >
              <div>
                <label className={`block text-xs ${textTertiary} mb-1`}>
                  {t("order_status")}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
                >
                  <option value="all">{t("all_statuses")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="processing">{t("processing")}</option>
                  <option value="shipped">{t("shipped")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="canceled">{t("canceled")}</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs ${textTertiary} mb-1`}>
                  {t("reconciliation_status")}
                </label>
                <select
                  value={filters.reconciliationStatus}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      reconciliationStatus: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
                >
                  <option value="all">{t("all_statuses")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="approved">{t("approved")}</option>
                  <option value="disputed">{t("disputed")}</option>
                  <option value="rejected">{t("rejected")}</option>
                  <option value="cancelled">{t("canceled")}</option>
                  <option value="closed">{t("paid")}</option>
                </select>
              </div>

              <div className="relative business-search-container">
                <label className={`block text-xs ${textTertiary} mb-1`}>
                  {t("vendor_business")}
                </label>
                <input
                  type="text"
                  placeholder={
                    filters.businessId
                      ? t("selected_vendor")
                      : t("search_vendors")
                  }
                  value={businessSearch}
                  onChange={(e) => searchBusinesses(e.target.value)}
                  onFocus={() => {
                    if (!filters.businessId && !showBusinessDropdown) {
                      setShowBusinessDropdown(true);
                    }
                  }}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
                />
                {(showBusinessDropdown || businessSearch) && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-1 border ${borderColor} rounded-lg ${bgSecondary} shadow-lg z-50 max-h-48 overflow-y-auto`}
                  >
                    {isSearchingBusinesses ? (
                      <div
                        className={`p-2 text-center text-sm ${textTertiary}`}
                      >
                        {t("loading")}
                      </div>
                    ) : businesses.length > 0 ? (
                      businesses.map((business) => (
                        <button
                          key={business._id}
                          onClick={() => {
                            setFilters({
                              ...filters,
                              businessId: business._id,
                            });
                            selectBusiness(business);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${textPrimary}`}
                        >
                          {business.name}
                        </button>
                      ))
                    ) : (
                      <div
                        className={`p-2 text-center text-sm ${textTertiary}`}
                      >
                        {t("no_businesses_found")}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
          )}
        </div>
      )}

      {adminView ? (
        <>
          {/* Orders Table / Superadmin Monthly Summary */}
          {showVenderWiseOrderTable ? (
            <>
              {filters.businessId && (
                <div className="mb-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToVendorSummary}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg border text-sm transition-colors flex items-center gap-2 shrink-0",
                      isDark
                        ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                        : "border-gray-300 hover:bg-gray-100 text-gray-600",
                    )}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("back_to_vendor_summary")}
                  </button>

                  {activeVendor && (
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                          isDark
                            ? "bg-teal-900/30 text-teal-400"
                            : "bg-teal-50 text-teal-700",
                        )}
                      >
                        {activeVendor.vendor_info.businessLogo?.image ? (
                          <img
                            src={activeVendor.vendor_info.businessLogo.image}
                            alt={
                              activeVendor.vendor_info.businessLogo.alt ||
                              activeVendor.vendor_info.name ||
                              "-"
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={clsx(
                            "font-semibold text-sm truncate",
                            textPrimary,
                          )}
                        >
                          {activeVendor.vendor_info.name || "-"}
                        </div>
                        <div className={clsx("text-xs truncate", textTertiary)}>
                          {activeVendor.owner_info.email || "-"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <ReordableDataTable
                rowKey="_id"
                data={orders}
                isDataLoading={isLoading || isFetching}
                onRowClick={(order: IMonthlyOrder) => handleViewDetails(order)}
                storageKey="vendorMonthlyReportColumnOrder"
                columns={columns}
                hasMore={hasMore}
                next={fetchNextPage}
                selectedItems={undefined}
                onSelectionChange={undefined}
              />
            </>
          ) : (
            <VendorMonthlySummaryCards
              adminView={adminView}
              vendors={vendorSummaries}
              isLoading={isVendorSummaryLoading}
              isFetching={isVendorSummaryFetching}
              hasMore={hasMoreVendorSummaries}
              fetchNextPage={fetchNextVendorSummaryPage}
              onViewVendorOrders={handleViewVendorOrders}
            />
          )}
        </>
      ) : (
        <ReordableDataTable
          rowKey="_id"
          data={orders}
          isDataLoading={isLoading || isFetching}
          onRowClick={(order: IMonthlyOrder) => handleViewDetails(order)}
          storageKey="vendorMonthlyReportColumnOrder"
          columns={columns}
          hasMore={hasMore}
          next={fetchNextPage}
          selectedItems={undefined}
          onSelectionChange={undefined}
        />
      )}

      {/* Modals */}
      {showOrderDetails && displayedOrder && (
        <OrderDetailsModal
          order={displayedOrder}
          loading={isDetailsLoading}
          onClose={closeDetails}
          onDispute={() => {
            setSelectedOrder(displayedOrder);
            setShowOrderDetails(false);
            setShowDisputeModal(true);
          }}
          onReopenDispute={() => handleReopenDispute(displayedOrder)}
          onCancel={() => {
            setSelectedOrder(displayedOrder);
            setShowOrderDetails(false);
            setShowCancelModal(true);
          }}
          adminView={adminView}
        />
      )}

      {showDisputeModal && selectedOrder && (
        <DisputeModal
          order={selectedOrder}
          isReopen={isReopenDisputeFlow}
          onClose={() => {
            setShowDisputeModal(false);
            setIsReopenDisputeFlow(false);
            closeDetails();
          }}
          onSubmit={
            isReopenDisputeFlow
              ? handleSubmitReopenDispute
              : handleSubmitDispute
          }
        />
      )}

      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          // loading={isCancelling}
          onClose={() => {
            setShowCancelModal(false);
            closeDetails();
          }}
          onSubmit={handleSubmitCancel}
        />
      )}

      {showAdminDisputeModal && displayedOrder && (
        <AdminDisputeResponseModal
          order={displayedOrder}
          disputeId={displayedOrder.disputeId}
          // loading={isDetailsLoading}
          onClose={() => {
            setShowAdminDisputeModal(false);
            closeDetails();
          }}
          onResolve={handleAdminResolveDispute}
        />
      )}

      {showCloseAllOrdersModal && (
        <CloseAllOrdersModal
          targetMonthLabel={closeAllOrdersTargetMonthLabel}
          monthFilter={filters.month}
          customDateFrom={filters.startDate}
          customDateTo={filters.endDate}
          sweptMonths={finalizeSweepPreview?.sweptMonths ?? []}
          isLoadingPreview={isFetchingSweepPreview}
          hasPreviewError={isSweepPreviewError}
          isConfirming={isClosingAllOrders}
          onClose={() => setShowCloseAllOrdersModal(false)}
          onConfirm={handleCloseAllOrders}
          previewErrorMessage={sweepPreviewErrorMessage}
        />
      )}

      <ConfirmDialog
        open={showBulkCompleteConfirm}
        title={t("mark_orders_completed_confirm_title")}
        message={t("mark_orders_completed_confirm_message")}
        confirmText={t("approve_pending_orders")}
        variant="warning"
        loading={isBulkCompleting}
        onCancel={() => setShowBulkCompleteConfirm(false)}
        onConfirm={handleBulkMarkOrderCompleted}
      />

      {showVendorBankDetailsModal && !adminView && (
        <VendorBankDetails
          adminView={adminView}
          ownerInfo={{
            _id: vendorBankDetails?.id,
            name:
              vendorBankDetails?.firstName + " " + vendorBankDetails?.lastName,
            email: vendorBankDetails?.email || "",
            phone: vendorBankDetails?.phoneDetails?.phoneNumber || "",
          }}
          setIsOpen={(open) => {
            if (!open) setShowVendorBankDetailsModal(false);
          }}
          savedBankAccount={
            vendorBankDetails?.bankAccount
              ? {
                  bankNumber: vendorBankDetails?.bankAccount.bankNumber,
                  branchNumber: vendorBankDetails?.bankAccount.branchNumber,
                  accountNumber: vendorBankDetails?.bankAccount.accountNumber,
                  businessNumberByGovt:
                    vendorBankDetails?.bankAccount.businessNumberByGovt,
                  invoiceName: vendorBankDetails?.bankAccount.invoiceName,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
