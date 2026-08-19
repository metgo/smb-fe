import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Clock, AlertTriangle, Building2, ArrowLeft } from "lucide-react";
import {
  AdminDisputeResponseModal,
  CancelOrderModal,
  CloseAllOrdersModal,
  DisputeModal,
  OrderDetailsModal,
  VendorMonthlySummaryCards,
  ExportOrdersButton,
} from "./components"
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllWebsitesQuery } from "@/store/api/websiteConfigApi";
import type { VendorPaymentSummaryRow } from "@/store/api/reconciliationQueryApi";
import SearchInput from "@/components/shared/SearchInput";
import {
  ReordableDataTable,
  FilterChips,
  ConfirmDialog,
} from "@/components/shared";
import MonthFilter from "@/pages/orders-mgmt/components/MonthFilter";
import FilterButton from "@/components/btns/FilterButton";
import clsx from "clsx";
import { useVendorMonthlyReportData } from "./hooks/useVendorMonthlyReportData";
import { useVendorPaymentSummaryData } from "./hooks/useVendorPaymentSummaryData";
import { useBusinessSearch } from "./hooks/useBusinessSearch";
import { useOrderStats } from "./hooks/useOrderStats";
import { useOrderActions } from "./hooks/useOrderActions";
import { mapOrderProductList, buildOrderColumns } from "./helpers";

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

  const [filters, setFilters] = useState({
    status: "all",
    reconciliationStatus: "all",
    startDate: "",
    endDate: "",
    month: "all",
    businessId: "",
  });

  const [activeVendor, setActiveVendor] = useState<VendorPaymentSummaryRow | null>(null);

  const {
    businessSearch,
    businesses,
    showBusinessDropdown,
    setShowBusinessDropdown,
    isSearchingBusinesses,
    selectedBusinessName,
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
    isLoading: isVendorSummaryLoading,
    isFetching: isVendorSummaryFetching,
    hasMore: hasMoreVendorSummaries,
    fetchNextPage: fetchNextVendorSummaryPage,
  } = useVendorPaymentSummaryData(
    { month: filters.month, startDate: filters.startDate, endDate: filters.endDate },
    searchTerm,
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

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== "all" ||
      filters.reconciliationStatus !== "all" ||
      filters.businessId !== "" ||
      filters.month !== "all" ||
      filters.startDate !== "" ||
      filters.endDate !== ""
    );
  }, [filters]);

  const handleClearAllFilters = () => {
    setFilters({
      status: "all",
      reconciliationStatus: "all",
      startDate: "",
      endDate: "",
      month: "all",
      businessId: "",
    });
    resetBusinessSearch();
  };

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
    selectedItems,
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
    <div className="h-screen">
      {/* Header */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-5 mb-6`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className={`text-lg font-bold ${textPrimary}`}>
              {tc("vendor_reconciliation")}
            </h1>
            <p className={`text-sm ${textTertiary}`}>
              {t("review_and_approve_orders")}
            </p>
          </div>
          {adminView && (
            <button
              onClick={() => setShowCloseAllOrdersModal(true)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              {t("close_all_orders")}
            </button>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 mb-6`}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className={`${bgSecondary} rounded-lg px-3 py-2`}>
            <div className={`text-xs ${textTertiary}`}>{t("total_orders")}</div>
            <div className={`text-lg font-bold ${textPrimary}`}>
              {stats.totalOrders}
            </div>
          </div>
          <div className={`${bgSecondary} rounded-lg px-3 py-2`}>
            <div className={`text-xs ${textTertiary}`}>
              {t("total_revenue")}
            </div>
            <div className={`text-lg font-bold ${textPrimary}`}>
              ₪{(stats.totalRevenue || 0).toLocaleString()}
            </div>
          </div>

          <div className={`${bgSecondary} rounded-lg px-3 py-2`}>
            <div className={`text-xs ${textTertiary}`}>{t("net_payout")}</div>
            <div
              className={`text-lg font-bold ${isDark ? "text-green-400" : "text-green-600"}`}
            >
              ₪{(stats.netPayout || 0).toLocaleString()}
            </div>
          </div>

          <div className={`${bgSecondary} rounded-lg px-3 py-2 col-span-2`}>
            <div className={`text-xs ${textTertiary} mb-1`}>
              {t("status_overview")}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <span className="flex items-center gap-1">
                <Clock
                  className={`w-3.5 h-3.5 ${isDark ? "text-yellow-400" : "text-yellow-600"}`}
                />
                <span className={textSecondary}>
                  {stats.pending} {t("pending")}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle
                  className={`w-3.5 h-3.5 ${isDark ? "text-green-400" : "text-green-600"}`}
                />
                <span className={textSecondary}>
                  {stats.approved} {t("approved")}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle
                  className={`w-3.5 h-3.5 ${isDark ? "text-orange-400" : "text-orange-600"}`}
                />
                <span className={textSecondary}>
                  {stats.disputed} {t("disputed")}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <XCircle
                  className={`w-3.5 h-3.5 ${isDark ? "text-red-400" : "text-red-600"}`}
                />
                <span className={textSecondary}>
                  {stats.cancelled} {t("canceled")}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`$ mb-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
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
              orders={orders}
              selectedOrders={selectedItems}
              t={t}
              monthFilter={filters.month}
              customDateFrom={filters.startDate}
              customDateTo={filters.endDate}
            />
            <FilterButton value={showFilters} onChange={setShowFilters} />
          </div>
        </div>

        {showFilters && (
          <div
            className={`mt-4 pt-4 border-t ${borderColor} grid grid-cols-1 md:grid-cols-3 gap-4`}
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
                    <div className={`p-2 text-center text-sm ${textTertiary}`}>
                      {t("loading")}
                    </div>
                  ) : businesses.length > 0 ? (
                    businesses.map((business) => (
                      <button
                        key={business._id}
                        onClick={() => {
                          setFilters({ ...filters, businessId: business._id });
                          selectBusiness(business);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${textPrimary}`}
                      >
                        {business.name}
                      </button>
                    ))
                  ) : (
                    <div className={`p-2 text-center text-sm ${textTertiary}`}>
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

            {hasActiveFilters && (
              <div className="col-span-full w-full">
                <div className="flex flex-wrap gap-1.5 items-center pt-2">
                  {filters.status !== "all" && (
                    <FilterChips
                      label={t(filters.status)}
                      onRemove={() => setFilters({ ...filters, status: "all" })}
                    />
                  )}
                  {filters.reconciliationStatus !== "all" && (
                    <FilterChips
                      label={t(
                        filters.reconciliationStatus === "closed"
                          ? "paid"
                          : filters.reconciliationStatus,
                      )}
                      onRemove={() =>
                        setFilters({ ...filters, reconciliationStatus: "all" })
                      }
                    />
                  )}
                  {filters.businessId && (
                    <FilterChips
                      label={selectedBusinessName || filters.businessId}
                      onRemove={() => {
                        setFilters({ ...filters, businessId: "" });
                        resetBusinessSearch();
                      }}
                    />
                  )}
                  {filters.month !== "all" && filters.month !== "custom" && (
                    <FilterChips
                      label={filters.month}
                      onRemove={() => setFilters({ ...filters, month: "all" })}
                    />
                  )}
                  {filters.month === "custom" && filters.startDate && (
                    <FilterChips
                      label={`From: ${filters.startDate}`}
                      onRemove={() => setFilters({ ...filters, startDate: "" })}
                    />
                  )}
                  {filters.month === "custom" && filters.endDate && (
                    <FilterChips
                      label={`To: ${filters.endDate}`}
                      onRemove={() => setFilters({ ...filters, endDate: "" })}
                    />
                  )}

                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors shrink-0"
                    >
                      {t("clear_filters")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
                      isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-50 text-teal-700",
                    )}
                  >
                    {activeVendor.vendor_info.businessLogo?.image ? (
                      <img
                        src={activeVendor.vendor_info.businessLogo.image}
                        alt={activeVendor.vendor_info.businessLogo.alt || activeVendor.vendor_info.name || "-"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={clsx("font-semibold text-sm truncate", textPrimary)}>
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
          vendors={vendorSummaries}
          isLoading={isVendorSummaryLoading}
          isFetching={isVendorSummaryFetching}
          hasMore={hasMoreVendorSummaries}
          fetchNextPage={fetchNextVendorSummaryPage}
          onViewVendorOrders={handleViewVendorOrders}
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
    </div>
  );
};
