import React from "react";
import { AlertCircle } from "lucide-react";
import { ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface OrderListViewProps {
  isLoading: boolean;
  orders: any;
  hasMore: boolean;
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
  hasMore,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div
      className={`${
        isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
      } border rounded-lg overflow-hidden overflow-y-auto`}
    >
      {orders?.datas?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 ">
          <AlertCircle className={`w-12 h-12 ${textTertiary} mb-4`} />
          <p className={`${textSecondary}`}>{t("noOrdersFound")}</p>
        </div>
      ) : (
        <div className="flex flex-col overflow-hidden ">
          <div className="sticky">
            <ReordableDataTable
              rowKey="orderId"
              hasMore={hasMore}
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
        </div>
      )}
    </div>
  );
};

export default OrderListView;
