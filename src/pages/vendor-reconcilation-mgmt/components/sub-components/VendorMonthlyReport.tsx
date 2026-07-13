import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import OrderDetailsModal from "./OrderDetailsModal";
import DisputeModal from "./DisputeModal";
import CancelOrderModal from "./CancelOrderModal";
import { AdminDisputeResponseModal } from "./AdminDisputeReponseModal";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useCreateSignedUrlMutation } from "@/store/api/mediaMutationApi";
import { uploadWithProgress } from "@/helpers";
import {
  useGetOrderProductsQuery,
  useGetOrderProductDetailsQuery,
  useCancelOrderProductMutation,
  useApproveOrderProductMutation,
  useOpenDisputeMutation,
} from "@/store/api/reconciliationQueryApi";
import SearchInput from "@/components/shared/SearchInput";
import { ReordableDataTable } from "@/components/shared";

interface VendorMonthlyReportProps {
  adminView?: boolean;
}

interface OrderProduct {
  _id: string;
  orderId: string;
  productInformation: {
    _id: string;
    name: string;
    image: string;
    category: { _id: string; name: string };
  };
  orderInformation: {
    orderId: string;
    purchaseDate: string;
    status:
      | "pending"
      | "approved"
      | "disputed"
      | "canceled"
      | "processing"
      | "completed";
    quantity: number;
    unitPrice: number;
    total: number;
    platformFee: number;
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
  vendorInformation: {
    _id: string;
    name: string;
  };
}

function mapOrderProductList(d: any) {
  const customerName = [d.customer?.firstName, d.customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "";

  return {
    _id: d._id,
    orderId: d.orderId,
    productName: d.product?.name || "",
    productImage: d.product?.image?.image || "",
    productCategory: "",
    customerName,
    customerEmail: d.customer?.email || "",
    customerPhone: d.customer?.phone || "",
    purchaseDate: d.date || "",
    quantity: d.quantity || 0,
    unitPrice: d.price || 0,
    totalPrice: d.totalAmount || 0,
    platformFee: d.fee || 0,
    netToVendor: (d.totalAmount || 0) - (d.fee || 0),
    status: d.status === "processing" ? "pending" : d.status || "pending",
    paymentMethod: "",
    paymentStatus: d.reconciliationStatus || "",
    deliveryMethod: "",
    deliveryAddress: "",
    specialInstructions: "",
  };
}

function mapOrderProductDetails(d: OrderProduct) {
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
      ? "approved"
      : d.orderInformation?.status === "processing"
        ? "pending"
        : d.orderInformation?.status;

  return {
    _id: d._id,
    orderId: d.orderId,
    productName: d.productInformation?.name || "",
    productImage: d.productInformation?.image || "",
    productCategory: d.productInformation?.category?.name || "",
    customerName: d.customerInformation?.name?.trim() || "",
    customerEmail: d.customerInformation?.email || "",
    customerPhone: d.customerInformation?.phone || "",
    purchaseDate: d.orderInformation?.purchaseDate || "",
    quantity: d.orderInformation?.quantity || 0,
    unitPrice: d.orderInformation?.unitPrice || 0,
    totalPrice: d.orderInformation?.total || 0,
    platformFee: d.orderInformation?.platformFee || 0,
    netToVendor: (d.orderInformation?.total || 0) - (d.orderInformation?.platformFee || 0),
    status,
    paymentMethod: d.paymentInformation?.paymentMethod?.join(", ") || "",
    paymentStatus: d.paymentInformation?.paymentStatus || "",
    deliveryMethod: d.deliveryInformation?.deliveryMethod || "",
    deliveryAddress: address,
    specialInstructions: d.deliveryInformation?.specialInstructions || "",
  };
}

export type MonthlyOrder = ReturnType<typeof mapOrderProductList>;

export const VendorMonthlyReport = ({
  adminView = false,
}: VendorMonthlyReportProps) => {
  const { t } = useTranslation("reconciliation");
  const {
    isDark,
    isRTL,
    bgPrimary,
    textPrimary,
    borderColor,
    textSecondary,
    textTertiary,
  } = useThemeClasses();
  const { dmoId, authorityId, userRole } = useAppSelector((state) => state.auth);

  const [orders, setOrders] = useState<MonthlyOrder[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ReturnType<
    typeof mapOrderProduct
  > | null>(null);
  console.log("🚀 ~ VendorMonthlyReport ~ selectedOrder:", selectedOrder)
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAdminDisputeModal, setShowAdminDisputeModal] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);

  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const apiParams = useMemo(() => {
    const params: any = {
      page,
      limit: 20,
      dmoId,
      authorityId,
    };

    if (filters.status !== "all") params.status = filters.status;
    if (searchTerm) params.search = searchTerm;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.minAmount) params.minAmount = filters.minAmount;
    if (filters.maxAmount) params.maxAmount = filters.maxAmount;

    return params;
  }, [
    page,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
    searchTerm,
    dmoId,
    authorityId,
  ]);

  const { data: orderProductsData, isLoading } =
    useGetOrderProductsQuery(apiParams);
  const { data: orderDetailsData, isFetching: isDetailsLoading } =
    useGetOrderProductDetailsQuery(detailsOrderId as string, {
      skip: !detailsOrderId,
    });
  const [cancelOrderProduct] = useCancelOrderProductMutation();
  const [approveOrderProduct] = useApproveOrderProductMutation();
  const [openDispute] = useOpenDisputeMutation();
  const [createSignedUrl] = useCreateSignedUrlMutation();

  const displayedOrder = useMemo(() => {
    if (orderDetailsData && detailsOrderId === selectedOrder?._id) {
      return mapOrderProductDetails(orderDetailsData);
    }
    return selectedOrder;
  }, [orderDetailsData, detailsOrderId, selectedOrder]);

  useEffect(() => {
    if (orderProductsData?.data) {
      const mappedOrders = orderProductsData.data.map(mapOrderProductList);

      if (page === 1) {
        setOrders(mappedOrders);
      } else {
        setOrders((prev) => {
          const existingIds = new Set(prev.map((o) => o._id));
          const newOrders = mappedOrders.filter((o) => !existingIds.has(o._id));
          return [...prev, ...newOrders];
        });
      }
    }
  }, [orderProductsData, page]);

  const hasMore =
    orderProductsData?.data?.length === 20 &&
    orderProductsData?.meta?.page < orderProductsData?.meta?.pages;

  const loadNextPage = () => {
    if (!hasMore || isLoading) return;
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
  ]);

  const stats = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "pending").length,
      approved: orders.filter((o) => o.status === "approved").length,
      disputed: orders.filter((o) => o.status === "disputed").length,
      canceled: orders.filter((o) => o.status === "canceled").length,
    }),
    [orders],
  );

  const handleOpenDispute = (order: MonthlyOrder) => {
    if (userRole !== "traveller") {
      toast.error("Only traveller role can open disputes");
      return;
    }
    setSelectedOrder(order);
    setShowDisputeModal(true);
  };

  const handleSubmitDispute = async (
    reason: string,
    details: string,
    files: File[],
  ) => {
    if (!selectedOrder) return;
    try {
      const attachmentUrls: string[] = [];

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const res = await createSignedUrl([
            { originalName: file.name, mimeType: file.type },
          ]);
          const { signedUrl, gcsURL } = res.data[0] as {
            signedUrl: string;
            gcsURL: string;
          };

          await uploadWithProgress(file, signedUrl, () => {});
          attachmentUrls.push(gcsURL);
        }
      }

      await openDispute({
        orderId: selectedOrder.orderId,
        reason,
        description: details,
        attachments: attachmentUrls,
      }).unwrap();

      toast.success(t("dispute_submitted"));
      setShowDisputeModal(false);
      setSelectedOrder(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      if (errorMessage?.includes("cannot be disputed")) {
        toast.error("This order cannot be disputed");
      } else if (errorMessage?.includes("role")) {
        toast.error("Only traveller role can open disputes");
      } else {
        toast.error(t("dispute_failed"));
      }
    }
  };

  const handleApprove = async (order: MonthlyOrder) => {
    try {
      await approveOrderProduct({
        orderId: order.orderId,
        orderProductId: order._id,
      }).unwrap();

      toast.success(t("order_approved"));
    } catch (error) {
      toast.error(t("approve_failed"));
    }
  };

  const handleCancelOrder = (order: MonthlyOrder) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleSubmitCancel = async (reason: string, notes: string) => {
    if (!selectedOrder) return;
    try {
      await cancelOrderProduct({
        orderId: selectedOrder.orderId,
        orderProductId: selectedOrder._id,
        cancelReason: reason,
        additionalInfo: notes,
      }).unwrap();

      toast.success(t("order_cancelled"));
      setShowCancelModal(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error(t("cancel_failed"));
    }
  };

  const handleViewDetails = (order: MonthlyOrder) => {
    setSelectedOrder(order);
    setDetailsOrderId(order._id);

    if (adminView && order.status === "disputed") {
      setShowAdminDisputeModal(true);
    } else {
      setShowOrderDetails(true);
    }
  };

  const closeDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setDetailsOrderId(null);
  };

  const handleAdminResolveDispute = (response: string, action: string) => {
    toast.success(t("dispute_resolved"));
    setShowAdminDisputeModal(false);
    setSelectedOrder(null);
    setDetailsOrderId(null);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { bg: string; text: string; icon: any; label: string }
    > = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        text: "text-yellow-800 dark:text-yellow-400",
        icon: Clock,
        label: t("pending"),
      },
      approved: {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-800 dark:text-green-400",
        icon: CheckCircle,
        label: t("approved"),
      },
      disputed: {
        bg: "bg-orange-100 dark:bg-orange-900/20",
        text: "text-orange-800 dark:text-orange-400",
        icon: AlertTriangle,
        label: t("disputed"),
      },
      canceled: {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-800 dark:text-red-400",
        icon: XCircle,
        label: t("canceled"),
      },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (amount === null || amount === undefined) return "₪0";
    return `₪${amount.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "product",
      sortable: false,
      label: t("product"),
      render: (order: MonthlyOrder) => (
        <div className="flex items-center gap-3">
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-12 h-12 rounded object-cover"
          />
          <div>
            <div className={`font-medium ${textPrimary}`}>
              {order.productName}
            </div>
            <div className={`text-xs ${textTertiary}`}>
              {order.productCategory}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      sortable: false,
      label: t("customer"),
      render: (order: MonthlyOrder) => (
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
      label: t("date"),
      render: (order: MonthlyOrder) => (
        <span className={textSecondary}>{formatDate(order.purchaseDate)}</span>
      ),
    },
    {
      key: "quantity",
      sortable: true,
      label: t("quantity"),
      render: (order: MonthlyOrder) => (
        <span className={textSecondary}>{order.quantity}</span>
      ),
    },
    {
      key: "totalPrice",
      sortable: true,
      label: t("price"),
      render: (order: MonthlyOrder) => (
        <div>
          <div className={`font-medium ${textPrimary}`}>
            {formatCurrency(order.totalPrice)}
          </div>
          <div className={`text-xs ${textTertiary}`}>
            {t("fee")}: {formatCurrency(order.platformFee)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      sortable: true,
      label: t("status"),
      render: (order: MonthlyOrder) =>
        getStatusBadge(order.status),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (order: MonthlyOrder) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {!adminView && order.status === "pending" && (
            <>
              <button
                onClick={() => handleApprove(order)}
                className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title={t("approve")}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenDispute(order)}
                className="p-1.5 rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                title={t("dispute")}
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancelOrder(order)}
                className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title={t("cancel")}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {adminView && order.status === "disputed" && (
            <button
              onClick={() => handleViewDetails(order)}
              className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {t("respond")}
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={textSecondary}>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 mb-6`}>
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>
            {adminView ? t("vendor_monthly_report") : t("monthly_report")}
          </h1>
          <p className={textTertiary}>{t("review_and_approve_orders")}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 mb-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t("search_by_order")}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              storageKey="vendorReconSearchTerm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textSecondary} flex items-center gap-2 transition-colors`}
          >
            <Filter className="w-4 h-4" />
            {t("filters")}
          </button>
        </div>

        {showFilters && (
          <div
            className={`mt-4 pt-4 border-t ${borderColor} grid grid-cols-1 md:grid-cols-3 gap-4`}
          >
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("status")}
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
                <option value="approved">{t("approved")}</option>
                <option value="disputed">{t("disputed")}</option>
                <option value="canceled">{t("canceled")}</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("date_from")}
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("date_to")}
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("min_amount")}
              </label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters({ ...filters, minAmount: e.target.value })
                }
                placeholder="₪0"
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("max_amount")}
              </label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters({ ...filters, maxAmount: e.target.value })
                }
                placeholder="₪10000"
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <ReordableDataTable
        rowKey="_id"
        data={orders}
        isDataLoading={isLoading}
        onRowClick={(order: MonthlyOrder) =>
          handleViewDetails(order)
        }
        storageKey="vendorMonthlyReportColumnOrder"
        columns={columns}
        hasMore={hasMore}
        next={loadNextPage}
      />

      {/* Modals */}
      {showOrderDetails && displayedOrder && (
        <OrderDetailsModal
          order={displayedOrder}
          loading={isDetailsLoading}
          onClose={closeDetails}
          onDispute={() => {
            setShowOrderDetails(false);
            setShowDisputeModal(true);
          }}
          onCancel={() => {
            setShowOrderDetails(false);
            setShowCancelModal(true);
          }}
          onApprove={() => {
            handleApprove(displayedOrder);
            closeDetails();
          }}
          adminView={adminView}
        />
      )}

      {showDisputeModal && selectedOrder && (
        <DisputeModal
          order={selectedOrder}
          onClose={() => {
            setShowDisputeModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmitDispute}
        />
      )}

      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          // loading={isCancelling}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmitCancel}
        />
      )}

      {showAdminDisputeModal && displayedOrder && (
        <AdminDisputeResponseModal
          order={displayedOrder}
          // loading={isDetailsLoading}
          onClose={() => {
            setShowAdminDisputeModal(false);
            setSelectedOrder(null);
            setDetailsOrderId(null);
          }}
          onResolve={handleAdminResolveDispute}
        />
      )}
    </div>
  );
};
