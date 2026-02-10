import React from "react";
import { Loader, AlertCircle } from "lucide-react";
import { ReordableDataTable } from "@/components/shared";

interface OrderListViewProps {
  theme: "dark" | "light";
  isLoading: boolean;
  orders: any;
  combinedOrders: any[];
  fetchNextPage: () => void;
  selectedOrders: Set<string>;
  setSelectedOrders: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleRowClick: (row: any) => void;
  columns: any[];
  textTertiary: string;
  textSecondary: string;
  t: (key: string) => string;
}

const OrderListView: React.FC<OrderListViewProps> = ({
  theme,
  isLoading,
  orders,
  combinedOrders,
  fetchNextPage,
  selectedOrders,
  setSelectedOrders,
  handleRowClick,
  columns,
  textTertiary,
  textSecondary,
  t,
}) => {
  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900/50 border-gray-800"
          : "bg-white border-gray-200"
      } border rounded-lg overflow-hidden`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : orders?.datas?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className={`w-12 h-12 ${textTertiary} mb-4`} />
          <p className={`${textSecondary}`}>{t("noOrdersFound")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-hidden max-h-[calc(100vh-400px)]">
          <ReordableDataTable
            rowKey="_id"
            data={combinedOrders || []}
            next={fetchNextPage}
            selectedItems={selectedOrders}
            onSelectionChange={setSelectedOrders}
            onRowClick={handleRowClick}
            storageKey="ordersTableColumnOrder"
            columns={columns}
            isDataLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default OrderListView;
