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
      className={`rounded-lg border overflow-hidden ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <h3 className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Transaction History
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`border-b ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <tr>
              {[
                "Product",
                "Business",
                "Customer",
                "Amount Used",
                "Qty",
                "Date",
                "Status",
              ].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody
            className={`divide-y ${
              isDark ? "divide-gray-800" : "divide-gray-200"
            }`}
          >
            {isOrderLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                    Loading...
                  </p>
                </td>
              </tr>
            ) : (
              ordersFromVoucher?.map((order) => (
                <tr
                  key={order._id}
                  className={isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"}
                >
                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {order.product?.image?.image && (
                        <img
                          src={order.product.image.image}
                          alt={order.product.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        {order.product?.name ?? "—"}
                      </span>
                    </div>
                  </td>

                  {/* Business */}
                  <td
                    className={`px-6 py-4 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {order.product?.business_info?.name ?? "—"}
                  </td>

                  {/* Customer */}
                  <td
                    className={`px-6 py-4 text-sm ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {order.firstName} {order.lastName}
                  </td>

                  {/* Amount Used */}
                  <td
                    className={`px-6 py-4 text-sm font-medium ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    ₪{amountUsed}
                  </td>

                  {/* Quantity */}
                  <td
                    className={`px-6 py-4 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {order.quantity}
                  </td>

                  {/* Date */}
                  <td
                    className={`px-6 py-4 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {formatDate(order.paymentDate)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isOrderLoading && ordersFromVoucher?.length === 0 && (
        <div className="text-center py-12">
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            {t("noOrdersFound")}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoucherTransactionTable;
