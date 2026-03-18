import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface Order {
  id: string;
  products: { name: string; quantity: string }[];
  orderInitiatedDate: string;
  status: TOrderStatus;
  paymentStatus: TPaymentStatus;
  firstName: string;
  lastName: string;
}

interface BusinessOrderSummary {
  businessName?: string;
  orders: Order[];
}

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  businessOrdersSummaries: BusinessOrderSummary[];
}

export const OrdersModal = ({
  isOpen,
  onClose,
  isLoading,
  businessOrdersSummaries,
}: OrdersModalProps) => {
  const { t } = useTranslation("orders");
  const { isDark, textPrimary, textSecondary } = useThemeClasses();

  if (!isOpen) return null;

  const getOrderStatusBadge = (status: TOrderStatus) => {
    const styles: Record<TOrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      shipped: "bg-purple-100 text-purple-700",
      canceled: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: TPaymentStatus) => {
    const styles: Record<TPaymentStatus, string> = {
      PAID: "bg-green-100 text-green-700",
      UNPAID: "bg-red-100 text-red-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
      REFUNDED: "bg-purple-100 text-purple-700",
      SUCCESS: "bg-green-100 text-green-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <ModalWrapper
      onClose={onClose}
      maxWidth="max-w-6xl"
      showSpinner={isLoading}
    >
      <div className={`p-4 flex flex-col z-100 overflow-hidden `}>
        <h2 className={clsx("text-2xl font-semibold mb-2 ", textPrimary)}>
          {t("orders")} -{" "}
          {businessOrdersSummaries?.map((business) => business?.businessName)}
        </h2>
        <div className="overflow-auto flex-1">
          <table
            className={`min-w-full border ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {" "}
            <thead
              className={clsx(
                "sticky -top-1 text-left z-10",
                isDark ? "bg-gray-800" : "bg-gray-100",
                textSecondary,
              )}
            >
              <tr className="">
                <th className="p-2 border w-56">{t("product_name")}</th>
                <th className="p-2 border w-48">{t("order_date")}</th>
                <th className="p-2 border w-28">{t("status")}</th>
                <th className="p-2 border w-32">{t("payment_status")}</th>
                <th className="p-2 border w-56">{t("customer_name")}</th>
                <th className="p-2 border w-24">{t("quantity")}</th>
              </tr>
            </thead>
            <tbody className={clsx(textPrimary)}>
              {businessOrdersSummaries?.map((business) =>
                business?.orders?.map((order) => (
                  <tr key={order.id} className="text-left">
                    <td className="p-2 border ">
                      {order?.products?.map((p) => p.name).join(", ")}
                    </td>
                    <td className="p-2 border">
                      {new Date(order?.orderInitiatedDate).toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {getOrderStatusBadge(order?.status)}
                    </td>{" "}
                    <td className="p-2 border">
                      {getPaymentStatusBadge(order?.paymentStatus)}
                    </td>
                    <td className="p-2 border">
                      {order?.firstName} {order?.lastName}
                    </td>
                    <td className="p-2 border">
                      {" "}
                      {order?.products?.map((p) => p?.quantity)}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModalWrapper>
  );
};
