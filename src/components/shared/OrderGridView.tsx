import { useRef } from "react";
import {
  AlertCircle,
  CalendarPlus,
  DollarSign,
  Image,
  Loader,
  Truck,
  User,
} from "lucide-react";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { GridCard } from "@/components/shared";
import { formatOrderDate } from "@/helpers";

interface GridViewProps<T> {
  data: T[];
  onRowClick?: (item: T) => void;
  next?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  t: (key: string) => string;
  selectedOrders: Set<string>;
  setSelectedOrders: React.Dispatch<React.SetStateAction<Set<string>>>;
}

function OrderGridView<T>({
  data,
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

  const getOrderStatusBadge = (status: IOrder["status"]) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        pending: {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-800 dark:text-orange-400",
          label: t("pending"),
        },
        processing: {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-400",
          label: t("processing"),
        },
        completed: {
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-800 dark:text-emerald-400",
          label: t("completed"),
        },
        shipped: {
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-800 dark:text-emerald-400",
          label: t("shipped"),
        },
        canceled: {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-400",
          label: t("cancelled"),
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

  const toggleRow = (order: any) => {
    const newSelected = new Set(selectedOrders);
    const key = order?.orderId;
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedOrders(newSelected);
  };

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
        id="business-table-scroll"
        ref={scrollRef}
        className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
          {data?.map((order: any) => (
            <GridCard
              key={order.orderId}
              image={order?.product?.image?.image}
              imageAlt={order?.orderId || "order"}
              imageHeight="h-36"
              fallbackIcon={Image}
              fallbackGradient="from-gray-400 to-teal-400"
              title={order?.product?.name || "-"}
              statusNode={getOrderStatusBadge(order?.status)}
              isChecked={selectedOrders?.has(order.orderId) ?? false}
              onCheckChange={() => toggleRow(order)}
              onClick={() => onRowClick?.(order)}
              meta={[
                { icon: User, label: order?.firstName || "-" },
                {
                  icon: DollarSign,
                  label: order?.totalAmount
                    ? `₪${order.totalAmount.toLocaleString()}`
                    : "-",
                },
                {
                  icon: Truck,
                  label: order?.deliveryFee
                    ? `₪${order.deliveryFee.toLocaleString()}`
                    : "-",
                },
                {
                  icon: CalendarPlus,
                  label: order?.createdAt
                    ? formatOrderDate(order.createdAt)
                    : "-",
                },
              ]}
            />
          ))}
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
