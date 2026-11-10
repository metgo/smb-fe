import { useCallback, useEffect, useRef, useState } from "react";
import {
  Building2,
  Mail,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  Truck,
  Wallet,
  Landmark,
  ListCollapse,
  Banknote,
  TriangleAlert,
  PauseCircle,
} from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import VendorBankDetails from "./VendorBankDetails";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import EmptyState from "@/components/reordable-data-table/EmptyState";
import type { VendorPaymentSummaryRow } from "@/store/api/reconciliationQueryApi";
import { ImageWithFallback } from "@/components/shared";

const formatCurrency = (amount?: number) => {
  if (amount === null || amount === undefined) return "-";
  return `₪${amount.toLocaleString()}`;
};

interface VendorMonthlySummaryCardsProps {
  vendors: VendorPaymentSummaryRow[];
  isLoading: boolean;
  isFetching: boolean;
  hasMore: boolean;
  adminView: boolean;
  fetchNextPage: () => void;
  onViewVendorOrders: (
    vendor: VendorPaymentSummaryRow,
    statusFilters?: { status?: string; reconciliationStatus?: string },
  ) => void;
}

const VendorMonthlySummaryCards = ({
  vendors,
  isLoading,
  isFetching,
  hasMore,
  adminView,
  fetchNextPage,
  onViewVendorOrders,
}: VendorMonthlySummaryCardsProps) => {
  const { t } = useTranslation("reconciliation");
  const { t: tc } = useTranslation("common");
  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textTertiary,
    borderColor,
    isDark,
  } = useThemeClasses();

  const [bankDetailsVendor, setBankDetailsVendor] =
    useState<VendorPaymentSummaryRow | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Keep the latest hasMore/isFetching/fetchNextPage in refs so the observer
  // callback always sees current values without needing to be torn down and
  // recreated on every fetch - recreating it mid-intersection was causing the
  // "sometimes it just stops loading more" behavior.
  const hasMoreRef = useRef(hasMore);
  const isFetchingRef = useRef(isFetching);
  const fetchNextPageRef = useRef(fetchNextPage);
  hasMoreRef.current = hasMore;
  isFetchingRef.current = isFetching;
  fetchNextPageRef.current = fetchNextPage;

  const observerRef = useRef<IntersectionObserver | null>(null);
  // Callback ref (rather than a plain ref + effect) so the observer attaches
  // fresh every time the sentinel element mounts - it unmounts/remounts as
  // `hasMore` toggles, and a one-time effect would miss re-attaching to it.
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreRef.current &&
          !isFetchingRef.current
        ) {
          fetchNextPageRef.current();
        }
      },
      { threshold: 0, rootMargin: "100px" },
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  const orderStats = [
    {
      key: "pendingCount",
      label: t("pending"),
      icon: Clock,
      status: "pending",
    },
    {
      key: "processingCount",
      label: t("processing"),
      icon: Loader2,
      status: "processing",
    },
    {
      key: "shippedCount",
      label: t("shipped"),
      icon: Truck,
      status: "shipped",
    },
    {
      key: "completedCount",
      label: t("completed"),
      icon: CheckCircle2,
      status: "completed",
    },
    {
      key: "canceledCount",
      label: t("canceled"),
      icon: XCircle,
      status: "canceled",
    },
  ] as const;

  const reconcillationStats = [
    {
      key: "pendingCount",
      // Reconciliation `pending` = default/unset (no dispute, not yet finalized),
      // not an action item - shown as "No Dispute" to match the status column.
      label: t("no_dispute"),
      // icon: Clock,
      icon: CheckCircle2,
      status: "pending",
    },
    {
      key: "approvedCount",
      label: t("approved"),
      icon: CheckCircle2,
      status: "approved",
    },
    {
      key: "rejectedCount",
      label: t("rejected"),
      icon: Truck,
      status: "rejected",
    },
    {
      key: "disputedCount",
      label: t("disputed"),
      icon: TriangleAlert,
      status: "disputed",
    },
    {
      key: "cancelledCount",
      label: t("canceled"),
      icon: XCircle,
      status: "cancelled",
    },
    {
      key: "pausedCount",
      label: t("paused"),
      icon: PauseCircle,
      status: "paused",
    },
  ] as const;

  if ((isLoading || isFetching) && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isLoading && !isFetching && vendors.length === 0) {
    return <EmptyState message={t("no_vendors_found")} />;
  }

  return (
    <div className="relative h-[calc(100vh-230px)] overflow-y-auto pr-2 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {vendors?.map((vendor) => {
          const vendorName = vendor.vendor_info.name || "-";
          return (
            <div
              key={vendor.vendor_info._id}
              className={clsx(
                bgPrimary,
                borderColor,
                "rounded-xl border shadow-sm hover:shadow-lg hover:border-teal-600/40 transition-all duration-200 overflow-hidden flex flex-col gap-2",
              )}
            >
              {/* Header */}
              <div className={clsx("p-2 border-b", borderColor)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                        isDark
                          ? "bg-teal-900/30 text-teal-400"
                          : "bg-teal-50 text-teal-700",
                      )}
                    >
                      {vendor.vendor_info.businessLogo?.image ? (
                        <ImageWithFallback
                          src={vendor.vendor_info.businessLogo.image}
                          alt={
                            vendor.vendor_info.businessLogo.alt || vendorName
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className={clsx(
                          "font-semibold text-base truncate",
                          textPrimary,
                        )}
                      >
                        {vendorName}
                      </h3>
                      <div
                        className={clsx(
                          "flex items-center gap-1 text-xs truncate",
                          textTertiary,
                        )}
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {vendor.owner_info.email || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title={
                        vendor.hasBankDetails
                          ? t("bank_details_verified")
                          : t("bank_details_missing")
                      }
                      onClick={() => {
                        setIsBankModalOpen(true);
                        setBankDetailsVendor(vendor);
                      }}
                      className={clsx(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                        vendor.hasBankDetails
                          ? "bg-teal-100/80 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                          : "bg-red-100/80 text-red-600 hover:bg-red-50 hover:text-red-700",
                      )}
                    >
                      <Landmark className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title={t("total_orders")}
                      onClick={() => onViewVendorOrders(vendor)}
                      className={clsx(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                        isDark
                          ? "bg-slate-800 text-slate-400 hover:bg-teal-900/40 hover:text-teal-400"
                          : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700",
                      )}
                    >
                      <ListCollapse className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={clsx(
                      "flex items-center gap-1.5 text-sm font-semibold",
                      textTertiary,
                    )}
                  >
                    <Package className="w-4 h-4" />
                    {t("total_orders")}
                  </div>
                  <span className={clsx("text-lg font-bold", textPrimary)}>
                    {vendor.orderSummary.totalCount}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {orderStats
                    .filter(({ key }) => vendor.orderSummary[key] > 0)
                    .map(({ key, label, icon: Icon, status }) => (
                      <button
                        type="button"
                        key={key}
                        title={label}
                        onClick={() => onViewVendorOrders(vendor, { status })}
                        className={clsx(
                          "rounded-lg px-2 py-1.5 flex items-center gap-1.5 text-start cursor-pointer transition-colors hover:ring-1 hover:ring-teal-600/40",
                          bgSecondary,
                        )}
                      >
                        <Icon
                          className={clsx(
                            "w-3.5 h-3.5 shrink-0",
                            isDark ? "text-teal-400" : "text-teal-700",
                          )}
                        />
                        <div className="min-w-0 space-x-0.5">
                          <span
                            className={clsx(
                              "text-sm font-bold leading-tight",
                              textPrimary,
                            )}
                          >
                            {vendor.orderSummary[key]}
                          </span>
                          <span
                            className={clsx(
                              "text-[11px] font-semibold leading-tight truncate",
                              textTertiary,
                            )}
                          >
                            {label}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Reconciliation summary */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={clsx(
                      "flex items-center gap-1.5 text-sm font-semibold",
                      textTertiary,
                    )}
                  >
                    <Banknote className="w-4 h-4" />
                    {t("payment_completed_orders")}
                  </div>
                  <span className={clsx("text-lg font-bold", textPrimary)}>
                    {vendor.reconciliationSummary.closedCount}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {reconcillationStats
                    .filter(({ key }) => vendor.reconciliationSummary[key] > 0)
                    .map(({ key, label, icon: Icon, status }) => (
                      <button
                        type="button"
                        key={key}
                        title={label}
                        onClick={() =>
                          onViewVendorOrders(vendor, {
                            reconciliationStatus: status,
                          })
                        }
                        className={clsx(
                          "rounded-lg px-2 py-1.5 flex items-center gap-1.5 text-start cursor-pointer transition-colors hover:ring-1 hover:ring-teal-600/40",
                          bgSecondary,
                        )}
                      >
                        <Icon
                          className={clsx(
                            "w-3.5 h-3.5 shrink-0",
                            isDark ? "text-teal-400" : "text-teal-700",
                          )}
                        />
                        <div className="min-w-0 space-x-0.5">
                          <span
                            className={clsx(
                              "text-sm font-bold leading-tight",
                              textPrimary,
                            )}
                          >
                            {vendor.reconciliationSummary[key]}
                          </span>
                          <span
                            className={clsx(
                              "text-[11px] font-semibold leading-tight truncate",
                              textTertiary,
                            )}
                          >
                            {label}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Amount summary */}
              <div className={clsx("px-4 pt-2 pb-4 border-t", borderColor)}>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={clsx(
                      "flex items-center gap-1.5 text-sm font-semibold",
                      textTertiary,
                    )}
                  >
                    <Wallet className="w-4 h-4" />
                    {t("payable_amount_to_vendor")}
                  </div>
                  <span
                    className={clsx(
                      "text-base font-bold",
                      isDark ? "text-teal-400" : "text-teal-700",
                    )}
                  >
                    {formatCurrency(vendor.amount.netPayment)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className={clsx("text-sm font-semibold", textPrimary)}>
                      {formatCurrency(vendor.amount.itemsAmount)}
                    </div>
                    <div
                      className={clsx("text-[11px] font-bold", textTertiary)}
                    >
                      {t("total_sales")}
                    </div>
                  </div>
                  <div>
                    <div className={clsx("text-sm font-semibold", textPrimary)}>
                      {formatCurrency(vendor.amount.deliveryFee)}
                    </div>
                    <div
                      className={clsx("text-[11px] font-bold", textTertiary)}
                    >
                      {t("delivery_fee")}
                    </div>
                  </div>
                  <div>
                    <div className={clsx("text-sm font-semibold", textPrimary)}>
                      {formatCurrency(vendor.amount.total)}
                    </div>
                    <div
                      className={clsx("text-[11px] font-bold", textTertiary)}
                    >
                      {t("grand_total")}
                    </div>
                  </div>
                  <div>
                    <div className={clsx("text-sm font-semibold", textPrimary)}>
                      {formatCurrency(vendor.amount.platformCharge)}
                    </div>
                    <div
                      className={clsx("text-[11px] font-bold", textTertiary)}
                    >
                      {t("platform_fee")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        ref={sentinelCallbackRef}
        className="flex flex-col items-center justify-center gap-2 py-6"
      >
        {isFetching ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <span className={clsx("text-sm font-medium", textTertiary)}>
              {tc("loading_text")}
            </span>
          </>
        ) : !hasMore && vendors.length > 0 ? (
          <span className={clsx("text-sm font-medium", textTertiary)}>
            {tc("loading_end_text")}
          </span>
        ) : null}
      </div>

      {isBankModalOpen && bankDetailsVendor && (
        <VendorBankDetails
          adminView={adminView}
          ownerInfo={{
            _id: bankDetailsVendor.owner_info._id,
            name: bankDetailsVendor.owner_info.name,
            email: bankDetailsVendor.owner_info.email,
            phone: bankDetailsVendor.owner_info.phone,
          }}
          setIsOpen={(open) => {
            if (!open) setBankDetailsVendor(null);
          }}
          savedBankAccount={
            bankDetailsVendor.bankDetails
              ? {
                  bankNumber: bankDetailsVendor.bankDetails.bankNumber,
                  branchNumber: bankDetailsVendor.bankDetails.branchNumber,
                  accountNumber: bankDetailsVendor.bankDetails.accountNumber,
                  businessNumberByGovt:
                    bankDetailsVendor.bankDetails.businessNumberByGovt,
                  invoiceName: bankDetailsVendor.bankDetails.name,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default VendorMonthlySummaryCards;
