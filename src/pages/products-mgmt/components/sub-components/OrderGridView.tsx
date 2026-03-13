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
import clsx from "clsx";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import { Checkbox } from "@/components/ui/checkbox";
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

  const getOrderStatusBadge = (status: IOrder["status"]) => {
    const badges = {
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

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading,
    onLoadMore: next,
  });

  if (data.length === 0) {
    return (
      <div className="flex flex-col overflow-hidden h-[calc(108vh-210px)]">
        <AlertCircle
          className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        />
        <h3
          className={`text-lg mb-2 text-center ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("noOrdersFound")}
        </h3>
      </div>
    );
  }
  const toggleRow = (order: any) => {
    const newSelected = new Set(selectedOrders);
    const key = order?.orderId;
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedOrders(newSelected);
  };

  return (
    <div
      className={`py-3 px-2 rounded-xl ${
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"
      }`}
    >
      <div
        id="business-table-scroll"
        ref={scrollRef}
        className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
          {data?.map((order: any) => (
            <div
              key={order.orderId}
              onClick={() => onRowClick?.(order)}
              className={clsx(
                `rounded-xl border-2 border-gray-300 overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative`,
                isDark ? "bg-gray-900 text-gray-300" : "bg-white text-gray-900",
              )}
            >
              <div className="absolute top-3 left-0 z-30 w-full flex items-center justify-start gap-2 px-2">
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                  checked={selectedOrders?.has(order.orderId) ?? false}
                  onCheckedChange={() => toggleRow(order)}
                  className={`cursor-pointer border-2 transition-colors border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 `}
                />
                <p>
                  <span className="font-bold">
                    {" "}
                    {getOrderStatusBadge(order?.status) || "-"}
                  </span>{" "}
                </p>
              </div>
              {/* Thumbnail */}
              <div className="relative h-42">
                {order?.product?.image?.image ? (
                  <ImageWithFallback
                    src={order?.product?.image?.image}
                    alt={order?.orderId || "order"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-gray-400 to-teal-400 flex items-center justify-center">
                    <Image className="w-20 h-20 text-white/40" />
                  </div>
                )}
              </div>

              {/* Body */}
              <div
                className={`p-3 min-h-[16vh] ${
                  isDark
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-600"
                }`}
              >
                <div className="text-sm space-y-3">
                  {/* Product name */}
                  <p className="font-semibold">{order?.product?.name || "-"}</p>

                  {/* Purchaser */}
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">
                      {order?.firstName || "-"}
                    </span>
                  </p>

                  {/* Price */}
                  <p className="flex items-center gap-2">
                    <span className="font-medium">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <span className="font-semibold">
                      {order?.totalAmount
                        ? `₪${order.totalAmount.toLocaleString()}`
                        : "-"}
                    </span>
                  </p>

                  {/* Delivery Fee */}
                  <p className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span className="font-bold">
                      {order?.deliveryFee
                        ? `₪${order.deliveryFee.toLocaleString()}`
                        : "-"}
                    </span>
                  </p>

                  {/* Created At */}
                  <p className="flex items-center gap-2">
                    <CalendarPlus className="w-4 h-4" />
                    <span className="font-semibold">
                      {order?.createdAt
                        ? formatOrderDate(order.createdAt)
                        : "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div>
              <h2 className="h-20 flex justify-center text-center">
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader className="w-10 h-10 animate-spin text-teal-600" />
                </div>
              </h2>
            </div>
          )}
        </div>
      </div>
      {/* <ConfirmDialog
        open={isConfirmOpen}
        title={t("delete_product")}
        message={t("delete_product_confirm")}
        confirmText="delete"
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (!itemToDelete) return;
          handleProductDelete(itemToDelete);
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
      /> */}
    </div>
  );
}

export default OrderGridView;
