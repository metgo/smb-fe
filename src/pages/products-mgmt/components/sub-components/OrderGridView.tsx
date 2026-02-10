import { useRef, useState } from "react";
import { AlertCircle, Image, TrashIcon } from "lucide-react";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
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
  const toggleRow = (product: any) => {
    const newSelected = new Set(selectedOrders);
    const key = product._id;
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedOrders(newSelected);
  };
  return (
    <div
      className={`py-6 px-4 ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"
      }`}
    >
      <div
        id="business-table-scroll"
        ref={scrollRef}
        className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
          {data?.map((order: any) => (
            <div
              key={order._id}
              onClick={() => onRowClick?.(order)}
              className={`relative rounded-xl shadow-md overflow-hidden cursor-pointer transition-shadow hover:shadow-xl ${
                isDark ? "bg-gray-900" : "bg-white"
              }`}
            >
              <div className="absolute top-3 left-0 z-30 w-full flex items-center justify-between px-2">
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                  checked={selectedOrders?.has(order._id) ?? false}
                  onCheckedChange={() => toggleRow(order)}
                  className={`cursor-pointer border transition-colors ${
                    isDark
                      ? "border-gray-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:text-white"
                      : "border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                  }`}
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmOpen(true);
                      setItemToDelete(order._id);
                    }}
                    className="z-5 p-1 cursor-pointer rounded-full text-red-600 bg-white"
                    aria-label={`Delete ${order.name}`}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
              {/* Thumbnail */}
              <div className="relative h-36">
                {order?.orderProducts?.[0]?.image?.image ? (
                  <ImageWithFallback
                    src={order.orderProducts[0].image.image}
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
                className={`p-5 ${
                  isDark
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-600"
                }`}
              >
                <div className="space-y-1 text-sm">
                  <p className="">
                    <span>
                      <span className="font-medium">
                        {t("purchaser_name")}:
                      </span>{" "}
                      {order?.firstName || "N/A"}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium">{t("total")}:</span>{" "}
                    {order?.totalAmount || "--"}
                  </p>
                  <p>
                    <span className="font-medium">{t("status")}:</span>{" "}
                    {order?.status || "--"}
                  </p>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full
                     bg-linear-to-r from-teal-500 to-cyan-500 text-white shadow-sm whitespace-nowrap"
                  >
                    #{order?.orderId || order?._id}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
