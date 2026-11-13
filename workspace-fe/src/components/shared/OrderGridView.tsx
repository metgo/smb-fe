import { useRef } from "react";
import { AlertCircle, Loader } from "lucide-react";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Checkbox } from "@/components/ui/checkbox";

interface GridColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface GridViewProps<T> {
  data: T[];
  columns: GridColumn<T>[];
  onRowClick?: (item: T) => void;
  next?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  t: (key: string) => string;
  selectedOrders: Set<string>;
  setSelectedOrders: React.Dispatch<React.SetStateAction<Set<string>>>;
}

function OrderGridView<T extends { _id: string }>({
  data,
  columns,
  onRowClick,
  hasMore,
  next,
  t,
  selectedOrders,
  setSelectedOrders,
  isLoading = false,
}: GridViewProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { isDark } = useThemeClasses();

  useInfiniteScroll({ ref: scrollRef, hasMore, isLoading, onLoadMore: next });

  const toggleRow = (order: any) => {
    const newSelected = new Set(selectedOrders);
    const key = order?._id;
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedOrders(newSelected);
  };

  const fieldColumns = columns.filter((col) => col.key !== "checkbox");

  if (data.length === 0) {
    return (
      <div className="flex flex-col overflow-hidden h-[calc(108vh-210px)]">
        <AlertCircle
          className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        />
        <h3
          className={`text-lg mb-2 text-center ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("noOrdersFound")}
        </h3>
      </div>
    );
  }

  return (
    <div
      className={`py-3 px-2 rounded-xl ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"}`}
    >
      <div
        id="orders-grid-scroll"
        ref={scrollRef}
        className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {data?.map((order: any) => {
            const isChecked = selectedOrders?.has(order._id) ?? false;
            return (
              <div
                key={order._id}
                onClick={() => onRowClick?.(order)}
                className={`rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer ${
                  isDark ? "bg-gray-900" : "bg-white"
                } ${
                  isChecked
                    ? "border-2 border-teal-500"
                    : `border ${isDark ? "border-gray-700" : "border-gray-200"}`
                }`}
              >
                <div
                  className={`flex items-center justify-between px-3 py-2 border-b ${
                    isDark ? "border-gray-800" : "border-gray-100"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleRow(order)}
                    className="cursor-pointer border-2 transition-colors border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                  />
                  <span
                    className={`text-xs truncate font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {order?._id}
                  </span>
                </div>

                <div className="px-3 py-2 space-y-1.5">
                  {fieldColumns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between gap-2 font-semibold"
                    >
                      <span
                        className={`text-xs shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {col.label}
                      </span>
                      <span
                        className={`text-sm text-right min-w-0 truncate ${
                          isDark ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        {col.render
                          ? col.render(order)
                          : (order?.[col.key] ?? "-")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <Loader className="w-10 h-10 animate-spin text-teal-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderGridView;
