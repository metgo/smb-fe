import React from "react";
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
  storageKey?: string;
}

const OrderListView: React.FC<OrderListViewProps> = ({
  isLoading,
  combinedOrders,
  fetchNextPage,
  selectedOrders,
  setSelectedOrders,
  handleRowClick,
  columns,
  hasMore,
  storageKey,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div
      className={`${
        isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
      } border rounded-lg overflow-hidden overflow-y-auto`}
    >
      <div className="flex flex-col overflow-hidden ">
        <div className="sticky">
          <ReordableDataTable
            rowKey="_id"
            hasMore={hasMore}
            data={combinedOrders || []}
            next={fetchNextPage}
            selectedItems={selectedOrders}
            onSelectionChange={setSelectedOrders}
            onRowClick={handleRowClick}
            storageKey={storageKey}
            columns={columns}
            isDataLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderListView;
