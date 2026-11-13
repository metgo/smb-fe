import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useCallback } from "react";

import { Mail, Phone } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, OrderListView } from "@/components/shared";

import { useGetAllOrdersQuery } from "@/store/api/orderQueryApi";
import { useBulkOrdersUpdateMutation } from "@/store/api/orderMutationApi";
import { useUserRoles } from "@/hooks/useUserRoles";
import { formatDateTime } from "@/helpers/formatter";
import {
  displayPaymentStatus,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/helpers";
import { toast } from "sonner";
import { OrderDetailsModal } from "@/pages/orders-mgmt/components";

const limit = 20;

interface MinisiteVoucherOrderListProps {
  voucher: IVoucherItem;
}

const MinisiteVoucherOrderList = ({
  voucher,
}: MinisiteVoucherOrderListProps) => {
  const { t } = useTranslation("orders");
  const { t: tVouchers } = useTranslation("vouchers");
  const { isSuperadmin } = useUserRoles();
  const { isDark, language } = useThemeClasses();
  const voucherId = voucher?._id;

  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [bulkOrdersUpdate] = useBulkOrdersUpdateMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [page, setPage] = useState(1);

  const [pendingRecipient, setPendingRecipient] = useState<
    "VENDOR" | "CUSTOMER" | null
  >(null);

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => {
      return prev + 1;
    });
  };

  const [combinedOrders, setCombinedOrders] = useState<any[]>([]);

  const orderQueryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      voucherId,
    };

    return params;
  }, [page, limit, voucherId]);

  const {
    data: orders,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllOrdersQuery(orderQueryParams);

  const hasMore = orders?.meta?.hasNextPage;
  const orderss = orders?.data ?? [];

  useEffect(() => {
    if (!orderss?.length) return;

    if (page === 1) {
      setCombinedOrders(orderss);
    } else {
      setCombinedOrders((prev) => {
        // Prevent duplicates (important!)
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = orderss.filter((b: any) => !existingIds.has(b._id));

        return [...prev, ...newItems];
      });
    }
  }, [orderss, page]);

  const columns = [
    {
      key: "productCount",
      label: t("productCount"),
      sortable: true,
      render: (order: any) => (
        <div className="text-sm">{order?.productCount ?? "-"}</div>
      ),
    },
    {
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
    {
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
    {
      key: "status",
      label: t("order_status"),
      render: (order: IOrder) => getOrderStatusBadge(order.status),
    },
    {
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
    {
      key: "createdAt",
      label: t("created_date"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm text-gray-500">
          {formatDateTime(order?.createdAt, language)}
        </div>
      ),
    },

    {
      key: "_id",
      label: t("_id"),
      sortable: true,
      render: (order: any) => (
        <div className="text-sm">{order?._id ?? "-"}</div>
      ),
    },
    {
      key: "name",
      label: t("purchaser_name_field"),
      sortable: true,
      render: (order: IOrder) => <div className="text-sm">{order?.name}</div>,
    },
    {
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

    {
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
  ];

  const handleRowClick = (order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleBulkResend = useCallback(
    async (recipient: "VENDOR" | "CUSTOMER") => {
      if (!selectedOrders.size) return;

      const toastId = toast.loading(t("resend_loading"));

      try {
        const results = await bulkOrdersUpdate({
          ordersId: Array.from(selectedOrders),
          emailRecipient: recipient,
        });

        if (results?.data) {
          toast.success(t("resend_success"), { id: toastId });
          setSelectedOrders(new Set());
          refetch();
        }
      } catch (error: any) {
        toast.error(error?.message || t("resend_failed"), {
          id: toastId,
        });
      } finally {
        setIsConfirmOpen(false);
        setIsBulkDelete(false);
      }
    },
    [selectedOrders, bulkOrdersUpdate, refetch],
  );

  const getPaymentStatusBadge = (status: TPaymentStatus) => {
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
  };

  const getOrderStatusBadge = (status: IOrder["status"]) => {
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
  };

  return (
    <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
      {voucher && (
        <div
          className={`${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} border rounded-lg p-4`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {isSuperadmin && voucher.code && (
                <span
                  className={`text-sm font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  {voucher.code}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                  voucher.status,
                  isDark,
                )}`}
              >
                {getStatusLabel(voucher.status)}
              </span>
            </div>
            <span
              className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {tVouchers("voucher_id")}: {voucher._id}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {tVouchers("assignee")}
              </div>
              <div
                className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                {voucher.assigneeInfo?.name || "-"}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {voucher.assigneeInfo?.email && (
                  <a
                    href={`mailto:${voucher.assigneeInfo.email}`}
                    className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-600"
                  >
                    <Mail className="w-3 h-3" />
                    {voucher.assigneeInfo.email}
                  </a>
                )}
              </div>
              {voucher.assigneeInfo?.phone && (
                <a
                  href={`tel:${voucher.assigneeInfo.phone}`}
                  className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-600 mt-1"
                >
                  <Phone className="w-3 h-3" />
                  {voucher.assigneeInfo.phone}
                </a>
              )}
            </div>

            <div>
              <div
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {tVouchers("amount")}
              </div>
              <div
                className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                ₪{voucher.amount}
              </div>
            </div>

            <div>
              <div
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {tVouchers("remaining")}
              </div>
              <div
                className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                ₪{voucher.remainingAmount}
              </div>
            </div>

            <div>
              <div
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {tVouchers("expiry")}
              </div>
              <div
                className={`text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                {formatDate(voucher.expireDate)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
      >
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
      </div>

      {selectedOrder && showOrderDetails && (
        <OrderDetailsModal
          t={t}
          orderId={selectedOrder._id}
          onClose={() => {
            setShowOrderDetails(false);
            setPage(1);
            refetch();
          }}
        />
      )}

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
};
export default MinisiteVoucherOrderList;
