import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Mail,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  Truck,
  AlertTriangle,
  Wallet,
  Landmark,
  ListCollapse,
} from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import VendorBankDetails from "./VendorBankDetails";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import EmptyState from "@/components/reordable-data-table/EmptyState";
import type { VendorPaymentSummaryRow } from "@/store/api/reconciliationQueryApi";

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
  onViewVendorOrders: (vendor: VendorPaymentSummaryRow) => void;
}

export const VendorMonthlySummaryCards = ({
  vendors,
  isLoading,
  isFetching,
  hasMore,
  adminView,
  fetchNextPage,
  onViewVendorOrders,
}: VendorMonthlySummaryCardsProps) => {
  const { t } = useTranslation("reconciliation");
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

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isFetching) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { threshold: 0, rootMargin: "100px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetching, fetchNextPage]);

  const orderStats = [
    { key: "pendingCount", label: t("pending"), icon: Clock },
    { key: "processingCount", label: t("processing"), icon: Loader2 },
    { key: "shippedCount", label: t("shipped"), icon: Truck },
    { key: "completedCount", label: t("completed"), icon: CheckCircle2 },
    { key: "canceledCount", label: t("canceled"), icon: XCircle },
    { key: "disputedCount", label: t("disputed"), icon: AlertTriangle },
  ] as const;

  if (isLoading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isLoading && vendors.length === 0) {
    return <EmptyState message={t("no_vendors_found")} />;
  }

  return (
    <div className="relative h-[calc(100vh-430px)] overflow-y-auto pr-2 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
        {vendors.map((vendor) => {
          const vendorName = vendor.vendor_info.name || "-";
          return (
            <div
              key={vendor.vendor_info._id}
              className={clsx(
                bgPrimary,
                borderColor,
                "rounded-xl border shadow-sm hover:shadow-lg hover:border-teal-600/40 transition-all duration-200 overflow-hidden flex flex-col",
              )}
            >
              {/* Header */}
              <div className={clsx("p-4 border-b", borderColor)}>
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
                        <img
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
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={clsx(
                      "flex items-center gap-1.5 text-xs font-medium",
                      textTertiary,
                    )}
                  >
                    <Package className="w-3.5 h-3.5" />
                    {t("total_orders")}
                  </div>
                  <span className={clsx("text-lg font-bold", textPrimary)}>
                    {vendor.orderSummary.totalCount}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {orderStats.map(({ key, label, icon: Icon }) => (
                    <div
                      key={key}
                      className={clsx(
                        "rounded-lg px-2 py-1.5 flex items-center gap-1.5",
                        bgSecondary,
                      )}
                    >
                      <Icon
                        className={clsx(
                          "w-3.5 h-3.5 shrink-0",
                          isDark ? "text-teal-400" : "text-teal-700",
                        )}
                      />
                      <div className="min-w-0">
                        <div
                          className={clsx(
                            "text-sm font-semibold leading-tight",
                            textPrimary,
                          )}
                        >
                          {vendor.orderSummary[key]}
                        </div>
                        <div
                          className={clsx(
                            "text-[10px] leading-tight truncate",
                            textTertiary,
                          )}
                        >
                          {label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount summary */}
              <div className={clsx("px-4 py-3 mt-auto border-t", borderColor)}>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={clsx(
                      "flex items-center gap-1.5 text-xs font-medium",
                      textTertiary,
                    )}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    {t("amount_summary")}
                  </div>
                  <span
                    className={clsx(
                      "text-base font-bold",
                      isDark ? "text-teal-400" : "text-teal-700",
                    )}
                  >
                    {formatCurrency(vendor.amount.total)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className={clsx("text-sm font-semibold", textPrimary)}>
                      {formatCurrency(vendor.amount.netPayment)}
                    </div>
                    <div className={clsx("text-[10px]", textTertiary)}>
                      {t("payable")}
                    </div>
                  </div>
                  <div>
                    <div className={clsx("text-sm font-semibold", textPrimary)}>
                      {formatCurrency(vendor.amount.deliveryFee)}
                    </div>
                    <div className={clsx("text-[10px]", textTertiary)}>
                      {t("delivery_fee")}
                    </div>
                  </div>
                  <div>
                    <div className={clsx("text-sm font-semibold", textPrimary)}>
                      {formatCurrency(vendor.amount.platformCharge)}
                    </div>
                    <div className={clsx("text-[10px]", textTertiary)}>
                      {t("platform_fee")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-6"
        >
          {isFetching && (
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          )}
        </div>
      )}

      {isBankModalOpen && bankDetailsVendor && (
        <VendorBankDetails
          adminView={adminView}
          userId={bankDetailsVendor.owner_info._id}
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
