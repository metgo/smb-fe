import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RotateCcw,
  PauseCircle,
} from "lucide-react";
import clsx from "clsx";
import { getLngWiseStr } from "@/helpers";
import { formatDateTime } from "@/helpers/formatter";
import { ImageWithFallback } from "@/components/shared";

export function mapOrderProductList(d: any, language: Language) {
  const customerName =
    [d.customer?.firstName, d.customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "";

  return {
    _id: d._id,
    orderId: d.orderId,
    productName: getLngWiseStr(
      language,
      d.product?.name,
      d.product?.nameHe,
      d.product?.nameAr,
    ),
    productImage: d.product?.image?.image || "",
    productCategory: "",
    customerName,
    vendorFacingResponse: d?.orderInformation?.vendorFacingResponse || "",
    customerEmail: d.customer?.email || "",
    customerPhone: d.customer?.phone || "",
    purchaseDate: d.createdAt || "",
    completedAt: d.completedAt || "",
    quantity: d.quantity || 0,
    unitPrice: d.price || 0,
    totalPrice: d.totalAmount || 0,
    platformFee: d.fee || 0,
    deliveryFee: d.deliveryFee || 0,
    // netPayout is already 0 unless COMPLETED & not disputed/cancelled -
    // recomputing from totalAmount+deliveryFee-fee would lose that gating.
    netToVendor: d.netPayout || 0,
    status: d.status,
    reconciliationStatus: d.reconciliationStatus,
    // list endpoint has no real payment-status field - leave blank rather
    // than fake it from reconciliationStatus, which briefly leaked through
    paymentStatus: "",
    externalApiId: d.externalApiId || "",

    paymentMethod: "",
    deliveryMethod: "",
    deliveryAddress: "",
    specialInstructions: "",
    disputeId: d.disputeId,
  };
}

interface OrderProductDetails {
  _id: string;
  orderId: string;
  productInformation: {
    _id: string;
    name: string;
    nameHe?: string;
    nameAr?: string;
    image: string;
    category: { _id: string; name: string };
  };
  orderInformation: {
    orderId: string;
    purchaseDate: string;
    completedAt?: string;
    status: "pending" | "shipped" | "canceled" | "processing" | "completed";
    quantity: number;
    unitPrice: number;
    total: number;
    platformFee: number;
    netPayout: number;
    deliveryFee: number;
    disputeId?: string;
    reconciliationStatus?:
      | "pending"
      | "approved"
      | "cancelled"
      | "disputed"
      | "rejected"
      | "closed"
      | "paused";
    vendorFacingResponse?: string;
  };
  customerInformation: {
    name: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
  };
  deliveryInformation: {
    deliveryMethod: string;
    address: {
      houseNo?: string;
      apartment?: string;
      street?: string;
      city?: string;
    };
    specialInstructions?: string;
  };
  paymentInformation: {
    paymentMethod: string[];
    paymentStatus: string;
    totalAmount: number;
  };
  externalApiId?: string;
  disputeId?: string;
}

export function mapOrderProductDetails(
  d: OrderProductDetails,
  language: Language,
) {
  const address = [
    d.deliveryInformation?.address?.houseNo,
    d.deliveryInformation?.address?.apartment,
    d.deliveryInformation?.address?.street,
    d.deliveryInformation?.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const status =
    d.orderInformation?.status === "completed"
      ? "completed"
      : d.orderInformation?.status === "processing"
        ? "processing"
        : d.orderInformation?.status;

  // Use reconciliationStatus from API response, fallback to status if not available
  const reconciliationStatus =
    d?.orderInformation?.reconciliationStatus || status;

  return {
    _id: d._id,
    orderId: d.orderId,
    productName: getLngWiseStr(
      language,
      d?.productInformation?.name,
      d?.productInformation?.nameHe,
      d?.productInformation?.nameAr,
    ),
    productImage: d?.productInformation?.image || "",
    productCategory: d?.productInformation?.category?.name || "",
    customerName: d?.customerInformation?.name?.trim() || "",
    customerEmail: d?.customerInformation?.email || "",
    customerPhone: d?.customerInformation?.phone || "",
    purchaseDate: d?.orderInformation?.purchaseDate || "",
    completedAt: d?.orderInformation?.completedAt || "",
    quantity: d?.orderInformation?.quantity || 0,
    unitPrice: d?.orderInformation?.unitPrice || 0,
    totalPrice: d?.orderInformation?.total || 0,
    platformFee: d?.orderInformation?.platformFee || 0,
    deliveryFee: d?.orderInformation?.deliveryFee || 0,
    vendorFacingResponse: d?.orderInformation?.vendorFacingResponse || "",

    // netPayout is already 0 unless COMPLETED & not disputed/cancelled -
    // recomputing from total+deliveryFee-platformFee would lose that gating.
    netToVendor: d?.orderInformation?.netPayout || 0,
    status,
    reconciliationStatus,
    externalApiId: d.externalApiId || "",
    paymentMethod: d?.paymentInformation?.paymentMethod?.join(", ") || "",
    paymentStatus: d?.paymentInformation?.paymentStatus || "",
    deliveryMethod: d?.deliveryInformation?.deliveryMethod || "",
    deliveryAddress: address,
    specialInstructions: d?.deliveryInformation?.specialInstructions || "",
    // details endpoint nests disputeId under orderInformation, list puts it top-level - check both
    disputeId: d.orderInformation?.disputeId || d.disputeId,
  };
}

export function formatCurrency(amount?: number) {
  if (amount === null || amount === undefined) return "-";
  return `₪${amount.toLocaleString()}`;
}

export function getStatusBadge(
  status: string,
  isDark: boolean,
  t: (key: string) => string,
  // "reconciliation" relabels the default `pending`/unset state as "No Dispute".
  // Reconciliation status stays `pending` for every order-product until Finalize
  // Payouts runs - it does NOT mean a dispute is pending or that the row needs
  // action, which is how "Pending" was being read. Order (delivery) status is
  // left untouched.
  context?: "reconciliation",
) {
  const isRecon = context === "reconciliation";

  const badges: Record<
    string,
    { bg: string; text: string; icon: any; label: string }
  > = {
    pending: isRecon
      ? {
          bg: isDark ? "bg-slate-800" : "bg-slate-100",
          text: isDark ? "text-slate-300" : "text-slate-600",
          icon: CheckCircle,
          label: t("no_dispute"),
        }
      : {
          bg: isDark ? "bg-yellow-900/20" : "bg-yellow-100",
          text: isDark ? "text-yellow-400" : "text-yellow-800",
          icon: Clock,
          label: t("pending"),
        },
    processing: {
      bg: isDark ? "bg-yellow-900/20" : "bg-yellow-100",
      text: isDark ? "text-yellow-400" : "text-yellow-800",
      icon: Clock,
      label: t("processing"),
    },
    approved: {
      bg: isDark ? "bg-green-900/20" : "bg-green-100",
      text: isDark ? "text-green-400" : "text-green-800",
      icon: CheckCircle,
      label: t("approved"),
    },
    completed: {
      bg: isDark ? "bg-green-900/20" : "bg-green-100",
      text: isDark ? "text-green-400" : "text-green-800",
      icon: CheckCircle,
      label: t("completed"),
    },
    disputed: {
      bg: isDark ? "bg-orange-900/20" : "bg-orange-100",
      text: isDark ? "text-orange-400" : "text-orange-800",
      icon: AlertTriangle,
      label: t("disputed"),
    },
    canceled: {
      bg: isDark ? "bg-red-900/20" : "bg-red-100",
      text: isDark ? "text-red-400" : "text-red-800",
      icon: XCircle,
      label: t("canceled"),
    },
    cancelled: {
      bg: isDark ? "bg-red-900/20" : "bg-red-100",
      text: isDark ? "text-red-400" : "text-red-800",
      icon: XCircle,
      label: t("canceled"),
    },
    rejected: {
      bg: isDark ? "bg-red-900/20" : "bg-red-100",
      text: isDark ? "text-red-400" : "text-red-800",
      icon: XCircle,
      label: t("rejected"),
    },
    closed: {
      bg: isDark ? "bg-green-900/20" : "bg-green-100",
      text: isDark ? "text-green-400" : "text-green-800",
      icon: CheckCircle,
      label: t("paid"),
    },
    // permanent write-off (old carried-over items nobody will chase to
    // completion) - neutral gray so it reads as "closed out" without
    // implying paid (green) or refused (red)
    paused: {
      bg: isDark ? "bg-gray-800" : "bg-gray-200",
      text: isDark ? "text-gray-400" : "text-gray-700",
      icon: PauseCircle,
      label: t("paused"),
    },
  };

  const badge =
    badges[(status || "").toLowerCase().trim()] ||
    badges.pending ||
    badges.processing;
  if (!badge) {
    return <span>{status}</span>;
  }
  const Icon = badge.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        badge.bg,
        badge.text,
      )}
    >
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
}

interface BuildOrderColumnsArgs {
  t: (key: string) => string;
  userRole: string | undefined;
  adminView: boolean;
  language: Language;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  websiteMap: Record<string, any>;
  reopenFetchingId: string | null;
  onOpenDispute: (order: IMonthlyOrder) => void;
  onReopenFromRow: (order: IMonthlyOrder) => void;
  onApproveDispute: (order: IMonthlyOrder) => void;
  onCancelOrder: (order: IMonthlyOrder) => void;
}

export function buildOrderColumns({
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
  onOpenDispute,
  onReopenFromRow,
  onApproveDispute,
  onCancelOrder,
}: BuildOrderColumnsArgs) {
  return [
    {
      key: "product",
      sortable: false,
      label: t("product"),
      minWidth: 200,
      render: (order: IMonthlyOrder) => (
        <div className="flex items-center gap-4 min-w-50">
          <ImageWithFallback
            src={order.productImage}
            alt={order.productName}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className={`font-medium text-base ${textPrimary} truncate`}>
              {order.productName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      sortable: false,
      label: t("customer"),
      render: (order: IMonthlyOrder) => (
        <div>
          <div className={`font-medium ${textPrimary}`}>
            {order.customerName}
          </div>
          <div className={`text-xs ${textTertiary}`}>{order.customerEmail}</div>
        </div>
      ),
    },
    {
      key: "purchaseDate",
      sortable: true,
      label: t("purchase_date"),
      render: (order: IMonthlyOrder) => (
        <span className={textSecondary}>
          {order.purchaseDate
            ? formatDateTime(order.purchaseDate, language)
            : "-"}
        </span>
      ),
    },
    {
      key: "quantity",
      sortable: true,
      label: t("quantity"),
      render: (order: IMonthlyOrder) => (
        <span className={textSecondary}>{order.quantity}</span>
      ),
    },
    {
      key: "totalPrice",
      sortable: true,
      label: t("price"),
      render: (order: IMonthlyOrder) => (
        <span className={`font-medium ${textPrimary}`}>
          {formatCurrency(order.totalPrice)}
        </span>
      ),
    },
    {
      key: "platformFee",
      sortable: true,
      label: t("platform_fee"),
      render: (order: IMonthlyOrder) => (
        <span className={`text-medium ${textPrimary}`}>
          {formatCurrency(order.platformFee)}
        </span>
      ),
    },
    {
      key: "deliveryFee",
      sortable: true,
      label: t("delivery_fee"),
      render: (order: IMonthlyOrder) => (
        <span className={`text-medium ${textPrimary}`}>
          {formatCurrency(order.deliveryFee)}
        </span>
      ),
    },
    {
      key: "status",
      sortable: false,
      label: t("order_status"),
      render: (order: IMonthlyOrder) => getStatusBadge(order.status, isDark, t),
    },
    {
      key: "reconciliationStatus",
      sortable: false,
      label: t("reconciliation_status"),
      render: (order: IMonthlyOrder) =>
        getStatusBadge(order.reconciliationStatus, isDark, t, "reconciliation"),
    },
    {
      key: "externalApiId",
      sortable: false,
      label: t("website"),
      render: (order: IMonthlyOrder) => {
        const website = websiteMap[order.externalApiId ?? ""];
        if (!website)
          return <span className={`text-sm ${textTertiary}`}>-</span>;
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
    {
      key: "completedAt",
      sortable: true,
      label: t("completed_at"),
      render: (order: IMonthlyOrder) => (
        <span className={textSecondary}>
          {order.completedAt
            ? formatDateTime(order.completedAt, language)
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (order: IMonthlyOrder) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {order.status !== "canceled" &&
            order.reconciliationStatus !== "disputed" &&
            order.reconciliationStatus !== "closed" &&
            order.reconciliationStatus !== "approved" &&
            order.reconciliationStatus !== "rejected" &&
            order.reconciliationStatus !== "cancelled" &&
            order.reconciliationStatus !== "paused" &&
            userRole === "traveller" && (
              <button
                onClick={() => onOpenDispute(order)}
                className={`p-1.5 rounded transition-colors ${
                  isDark
                    ? "text-orange-400 hover:bg-orange-900/20"
                    : "text-orange-600 hover:bg-orange-50"
                }`}
                title={t("dispute")}
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}
          {order.reconciliationStatus === "rejected" &&
            userRole === "traveller" && (
              <button
                onClick={() => onReopenFromRow(order)}
                disabled={reopenFetchingId === order._id}
                className={`p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "text-orange-400 hover:bg-orange-900/20"
                    : "text-orange-600 hover:bg-orange-50"
                }`}
                title={t("reopen_dispute_btn")}
              >
                {reopenFetchingId === order._id ? (
                  <div
                    className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                      isDark ? "border-orange-400" : "border-orange-600"
                    }`}
                  />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
              </button>
            )}
          {order.reconciliationStatus === "disputed" && adminView && (
            <button
              onClick={() => onApproveDispute(order)}
              className={`p-1.5 rounded-full transition-colors ${
                isDark
                  ? "text-green-400 hover:bg-green-900/20"
                  : "text-green-600 hover:bg-green-50"
              }`}
              title={t("approve")}
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
          {order.status !== "canceled" &&
            order.reconciliationStatus !== "disputed" &&
            order.reconciliationStatus !== "approved" &&
            order.reconciliationStatus !== "rejected" &&
            order.reconciliationStatus !== "closed" &&
            order.reconciliationStatus !== "cancelled" &&
            order.reconciliationStatus !== "paused" &&
            order.status !== "completed" && (
              <button
                onClick={() => onCancelOrder(order)}
                className={`p-1.5 rounded transition-colors ${
                  isDark
                    ? "text-red-400 hover:bg-red-900/20"
                    : "text-red-600 hover:bg-red-50"
                }`}
                title={t("cancel")}
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
        </div>
      ),
    },
  ];
}

export const shekel = (n: number) =>
  "₪" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
