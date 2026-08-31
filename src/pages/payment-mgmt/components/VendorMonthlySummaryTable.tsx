import {
  Building2,
  Loader2,
  Landmark,
  ListCollapse,
  TriangleAlert,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAppSelector } from "@/hooks/hooks";
import VendorBankDetails from "./VendorBankDetails";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useChatPresence } from "@/hooks/useChatPresence";
import { ChatPopup } from "@/components/chat-popup";
import EmptyState from "@/components/reordable-data-table/EmptyState";
import type { VendorPaymentSummaryRow } from "@/store/api/reconciliationQueryApi";
import { shekel } from "../helpers";

interface VendorMonthlySummaryTableProps {
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

function Detail({
  label,
  value,
  bgSecondary,
  textPrimary,
  textTertiary,
}: {
  label: string;
  value: string;
  bgSecondary: string;
  textPrimary: string;
  textTertiary: string;
}) {
  return (
    <div className={clsx("px-5 py-3", bgSecondary)}>
      <div
        className={clsx(
          "font-semibold text-[11px] uppercase tracking-wider",
          textTertiary,
        )}
      >
        {label}
      </div>
      <div className={clsx("mt-1 font-bold text-sm", textPrimary)}>{value}</div>
    </div>
  );
}

const VendorMonthlySummaryTable = ({
  vendors,
  isLoading,
  isFetching,
  hasMore,
  adminView,
  fetchNextPage,
  onViewVendorOrders,
}: VendorMonthlySummaryTableProps) => {
  const { t } = useTranslation("reconciliation");
  const { t: tc } = useTranslation("common");
  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textTertiary,
    borderColor,
    hoverBg,
    isDark,
  } = useThemeClasses();

  const authUser = useAppSelector((state) => state.auth.user);
  const currentUser: IChatUser | null = authUser
    ? {
        _id: authUser.id,
        name: `${authUser.firstName} ${authUser.lastName}`.trim(),
        email: authUser.email,
        role: authUser.role as TUserRole,
        dmoId: authUser.dmo?.id,
        authorityId: authUser.authority?.id,
      }
    : null;

  const [expanded, setExpanded] = useState<number | null>(null);

  const [bankDetailsVendor, setBankDetailsVendor] =
    useState<VendorPaymentSummaryRow | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const [chatReceiver, setChatReceiver] = useState<IChatUser | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const presence = useChatPresence(chatReceiver ? [chatReceiver._id] : []);

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

  const handleChatWithVendor = (vendor: VendorPaymentSummaryRow) => {
    if (!vendor.owner_info?._id) return;
    setChatReceiver({
      _id: vendor.owner_info._id,
      name: vendor.owner_info.name,
      email: vendor.owner_info.email ?? "",
      role: "traveller",
    });
    setIsChatMinimized(false);
  };

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
      <section
        className={clsx(
          "overflow-hidden rounded-xl border shadow-sm",
          borderColor,
          bgPrimary,
        )}
      >
        <div
          className={clsx(
            "hidden grid-cols-[minmax(0,1fr)_180px_130px_140px_136px_36px] items-center gap-4 border-b px-5 py-3 text-sm font-semibold md:grid",
            borderColor,
            textTertiary,
            bgSecondary,
          )}
        >
          <span>{t("vendor")}</span>
          <span>{t("orders")}</span>
          {/* <span>{t("paid_orders")}</span> */}
          <span>{t("open_disputes")}</span>
          <span className="text-right">{t("payable")}</span>
          <span className="text-center">{t("actions")}</span>
          <span />
        </div>

        {vendors?.map((v, index) => {
          const isOpen = expanded === index;
          const total = v.orderSummary.totalCount;
          return (
            <div
              key={v.vendor_info._id}
              className={clsx("border-b last:border-b-0", borderColor)}
            >
              <div
                onClick={() => setExpanded(isOpen ? null : index)}
                className={clsx(
                  "grid w-full grid-cols-1 items-center gap-4 px-5 py-4 text-left transition-colors md:grid-cols-[minmax(0,1fr)_180px_130px_140px_136px_36px]",
                  hoverBg,
                )}
              >
                {/* Vendor */}
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                      isDark
                        ? "bg-teal-900/30 text-teal-400"
                        : "bg-teal-50 text-teal-700",
                    )}
                  >
                    {v.vendor_info.businessLogo?.image ? (
                      <ImageWithFallback
                        src={v.vendor_info.businessLogo.image}
                        alt={
                          v.vendor_info.businessLogo.alt || v.owner_info.name
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={clsx(
                        "truncate font-semibold text-sm",
                        textPrimary,
                      )}
                    >
                      {v.vendor_info?.name}
                    </div>
                    <div className={clsx("truncate text-xs", textTertiary)}>
                      {v?.owner_info?.email}
                    </div>
                  </div>
                </div>

                {/* Orders */}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={clsx(
                        "font-mono text-sm font-semibold",
                        textPrimary,
                      )}
                    >
                      {v.orderSummary.completedCount ?? 0}/{total}
                    </span>
                    <span className={clsx("text-xs", textTertiary)}>
                      {t("completed")}
                    </span>
                  </div>
                  <div
                    className={clsx(
                      "mt-1.5 h-1 w-full max-w-40 overflow-hidden rounded-full",
                      bgSecondary,
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{
                        width: `${total ? ((v.orderSummary.completedCount ?? 0) / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Reconcillation */}
                {/* <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={clsx(
                        "font-mono text-sm font-semibold",
                        textPrimary,
                      )}
                    >
                      {v.reconciliationSummary.closedCount ?? 0}/{total}
                    </span>
                    <span className={clsx("text-xs", textTertiary)}>
                      {t("completed")}
                    </span>
                  </div>
                  <div
                    className={clsx(
                      "mt-1.5 h-1 w-full max-w-40 overflow-hidden rounded-full",
                      bgSecondary,
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{
                        width: `${total ? ((v.reconciliationSummary.closedCount ?? 0) / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div> */}

                {/* Open disputes */}
                <div className="text-sm">
                  {v?.reconciliationSummary?.disputedCount > 0 ? (
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
                        isDark
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-amber-100 text-amber-700",
                      )}
                    >
                      <TriangleAlert className="h-3 w-3" />
                      <span className="font-mono font-medium">
                        {v?.reconciliationSummary?.disputedCount}
                      </span>
                      <span>{t("open")}</span>
                    </span>
                  ) : (
                    <span className={textTertiary}>{t("none")}</span>
                  )}
                </div>

                {/* Payable */}
                <div className="text-base font-semibold md:text-right">
                  <span className={clsx("md:hidden", textTertiary)}>
                    {t("payable")}{" "}
                  </span>
                  <span
                    className={
                      v.amount.netPayment > 0
                        ? isDark
                          ? "text-teal-400"
                          : "text-teal-700"
                        : textTertiary
                    }
                  >
                    {shekel(v.amount.netPayment)}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-start gap-2 md:justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    title={
                      v.hasBankDetails
                        ? t("bank_details_verified")
                        : t("bank_details_missing")
                    }
                    onClick={() => {
                      setIsBankModalOpen(true);
                      setBankDetailsVendor(v);
                    }}
                    className={clsx(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer",
                      v.hasBankDetails
                        ? isDark
                          ? "border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20"
                          : "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                        : isDark
                          ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
                    )}
                  >
                    <Landmark className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title={`${t("chat_with")} ${v?.owner_info?.name}`}
                    onClick={() => handleChatWithVendor(v)}
                    className={clsx(
                      "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors text-[#ff6634] border-[#ff6634]",
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title={t("total_orders")}
                    onClick={() => onViewVendorOrders(v)}
                    className={clsx(
                      "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                      borderColor,
                      bgSecondary,
                      textTertiary,
                      isDark
                        ? "hover:text-teal-400 hover:border-teal-500/40"
                        : "hover:text-teal-700 hover:border-teal-400/40",
                    )}
                  >
                    <ListCollapse className="w-4 h-4" />
                  </button>
                </div>

                {/* Chevron */}
                <div className="hidden justify-end md:flex">
                  <ChevronDown
                    className={clsx(
                      "h-4 w-4 transition-transform",
                      textTertiary,
                      isOpen && "rotate-180",
                    )}
                  />
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div
                  className={clsx(
                    "grid grid-cols-2 gap-px overflow-hidden border-t sm:grid-cols-4",
                    borderColor,
                  )}
                >
                  <Detail
                    label={t("total_sales")}
                    value={shekel(v.amount.itemsAmount)}
                    bgSecondary={bgSecondary}
                    textPrimary={textPrimary}
                    textTertiary={textTertiary}
                  />
                  <Detail
                    label={t("delivery_fee")}
                    value={shekel(v.amount.deliveryFee)}
                    bgSecondary={bgSecondary}
                    textPrimary={textPrimary}
                    textTertiary={textTertiary}
                  />
                  <Detail
                    label={t("grand_total")}
                    value={shekel(v.amount.total)}
                    bgSecondary={bgSecondary}
                    textPrimary={textPrimary}
                    textTertiary={textTertiary}
                  />
                  <Detail
                    label={t("platform_fee")}
                    value={shekel(v.amount.platformCharge)}
                    bgSecondary={bgSecondary}
                    textPrimary={textPrimary}
                    textTertiary={textTertiary}
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

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

      {chatReceiver && currentUser && (
        <ChatPopup
          receiver={chatReceiver}
          currentUser={currentUser}
          minimized={isChatMinimized}
          presence={presence[chatReceiver._id]}
          onToggleMinimize={() => setIsChatMinimized((prev) => !prev)}
          onClose={() => setChatReceiver(null)}
        />
      )}
    </div>
  );
};

export default VendorMonthlySummaryTable;
