import { Loader, Package } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface Voucher {
  amount: any;
  remainingAmount: any;
}

export interface Order {
  _id: string;
  orderId: string;
  product: {
    _id: string;
    name: string;
    image?: { image: string };
    business_info?: { name: string };
  };
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAmount: number;
  amount: number;
  quantity: number;
  paymentDate: string;
  createdAt: string;
  itemType: string;
}

interface VoucherTransactionTableProps {
  isDark?: boolean;
  voucher?: Voucher;
  formatDate: (date: string | Date) => string;
  t?: any;
  ordersFromVoucher?: Order[];
  isOrderLoading?: boolean;
}

const VoucherTransactionTable: React.FC<VoucherTransactionTableProps> = ({
  isDark = false,
  voucher,
  formatDate,
  ordersFromVoucher,
  isOrderLoading,
}) => {
  const { t } = useTranslation("vouchers");
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return isDark
          ? "bg-green-900/30 text-green-300"
          : "bg-green-100 text-green-800";
      case "cancelled":
        return isDark
          ? "bg-red-900/30 text-red-300"
          : "bg-red-100 text-red-800";
      case "processing":
        return isDark
          ? "bg-blue-900/30 text-blue-300"
          : "bg-blue-100 text-blue-800";
      default:
        return isDark
          ? "bg-yellow-900/30 text-yellow-300"
          : "bg-yellow-100 text-yellow-800";
    }
  };

  const amountUsed =
    voucher && voucher.amount !== voucher.remainingAmount
      ? voucher.amount - voucher.remainingAmount
      : (voucher?.amount ?? 0);

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isDark
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      <div
        className={`px-5 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <h3
          className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("transaction_history")}
        </h3>
      </div>

      {isOrderLoading ? (
        <div className="py-14 flex items-center justify-center">
          <Loader
            className={`w-5 h-5 animate-spin ${isDark ? "text-gray-500" : "text-gray-400"}`}
          />
        </div>
      ) : !ordersFromVoucher?.length ? (
        <div className="py-14 flex flex-col items-center justify-center gap-2">
          <Package
            className={`w-8 h-8 ${isDark ? "text-gray-700" : "text-gray-200"}`}
          />
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {t("no_orders_found")}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div
            className={`md:hidden divide-y ${isDark ? "divide-gray-800" : "divide-gray-100"}`}
          >
            {ordersFromVoucher.map((order) => (
              <div
                key={order._id}
                className={`p-4 space-y-3 ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"} transition-colors`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {order.product?.image?.image && (
                      <img
                        src={order.product.image.image}
                        alt={order.product.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <span
                      className={`text-sm font-medium truncate ${isDark ? "text-gray-100" : "text-gray-900"}`}
                    >
                      {order.product?.name ?? "—"}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <div
                      className={`text-xs mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {t("customer")}
                    </div>
                    <div className={isDark ? "text-gray-200" : "text-gray-700"}>
                      {order.firstName} {order.lastName}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-xs mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {t("amount_used")}
                    </div>
                    <div
                      className={`font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
                    >
                      ₪{amountUsed}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-xs mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {t("business")}
                    </div>
                    <div className={isDark ? "text-gray-400" : "text-gray-600"}>
                      {order.product?.business_info?.name ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-xs mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {t("date")}
                    </div>
                    <div className={isDark ? "text-gray-400" : "text-gray-600"}>
                      {formatDate(order.paymentDate)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead
                className={`border-b ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}`}
              >
                <tr>
                  {[
                    t("product"),
                    t("business"),
                    t("customer"),
                    t("amount_used"),
                    t("quantity"),
                    t("date"),
                    t("status"),
                  ].map((header) => (
                    <th
                      key={header}
                      className={`px-5 py-3 text-left text-xs font-medium tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-100"}`}
              >
                {ordersFromVoucher.map((order) => (
                  <tr
                    key={order._id}
                    className={`transition-colors ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {order.product?.image?.image && (
                          <img
                            src={order.product.image.image}
                            alt={order.product.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <span
                          className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
                        >
                          {order.product?.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-5 py-3.5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {order.product?.business_info?.name ?? "—"}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}
                    >
                      {order.firstName} {order.lastName}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-sm font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
                    >
                      ₪{amountUsed}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {order.quantity}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {formatDate(order.paymentDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default VoucherTransactionTable;
