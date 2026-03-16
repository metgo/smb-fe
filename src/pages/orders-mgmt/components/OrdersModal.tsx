import { ModalWrapper } from "@/components/wrapper";

interface Order {
  id: string;
  products: { name: string }[];
  orderInitiatedDate: string;
  status: string;
  paymentStatus: string;
  firstName: string;
  lastName: string;
}

interface BusinessOrderSummary {
  orders: Order[];
}

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  businessOrdersSummaries: BusinessOrderSummary[];
  t?: any;
}

export const OrdersModal = ({
  isOpen,
  onClose,
  isLoading,
  businessOrdersSummaries,
  t,
}: OrdersModalProps) => {
  if (!isOpen) return null;
  return (
    <ModalWrapper onClose={onClose} showSpinner={isLoading}>
      <div className="p-4 flex flex-col h-full z-100 overflow-hidden">
        <h2 className="text-2xl font-semibold mb-4 shrink-0">{t("orders")}</h2>

        <div className="overflow-auto flex-1">
          <table className="min-w-full border border-gray-200">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="p-2 border">Product Name</th>
                <th className="p-2 border">Order Date</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Payment Status</th>
                <th className="p-2 border">Customer Name</th>
              </tr>
            </thead>
            <tbody>
              {businessOrdersSummaries?.map((business) =>
                business?.orders?.map((order) => (
                  <tr key={order.id} className="text-center">
                    <td className="p-2 border">
                      {order.products?.map((p) => p.name).join(", ")}
                    </td>
                    <td className="p-2 border">
                      {new Date(order.orderInitiatedDate).toLocaleString()}
                    </td>
                    <td className="p-2 border">{order.status}</td>
                    <td className="p-2 border">{order.paymentStatus}</td>
                    <td className="p-2 border">
                      {order.firstName} {order.lastName}
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
