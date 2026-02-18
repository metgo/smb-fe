import { toast } from "sonner";
import { useRef, useState } from "react";
import { Image, Loader, MapPin, Phone, TrashIcon } from "lucide-react";

import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { useDeleteBusinessMutation } from "@/store/api/businessMutationApi";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";

interface Business {
  _id: string;
  name: string;
  image?: string;
  location?: string;
  images: {
    image: string;
  }[];
  phoneNumber: string;
  address: {
    city: string;
    country: string;
    location: string;
  };
}

interface GridViewProps<T> {
  data: any[];
  onRowClick?: (item: T) => void;
  refetch: () => void;
  next?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  t: (key: string) => string;
}

function BusinessGridView<T extends Business>({
  t,
  data,
  onRowClick,
  refetch,
  hasMore,
  next,
  isLoading = false,
}: GridViewProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { isDark } = useThemeClasses();

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isLoading,
    onLoadMore: next,
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [deleteBusiness, { isLoading: isDeleting }] =
    useDeleteBusinessMutation();

  const handleBusinessDelete = async (businessId: string) => {
    const res = await deleteBusiness({ businessId });
    toast.success(res?.data?.message || "Business deleted successfully");
    refetch();
  };

  return (
    <div
      className={`py-6 px-4 ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-300 "
      } `}
    >
      <div
        className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto mb-20"
        id="business-table-scroll"
        ref={scrollRef}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {data?.map((business) => (
            <div
              key={business._id}
              className={`${isDark ? "bg-gray-900" : "bg-white"} dark:bg-gray-900 relative rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer`}
              onClick={() => onRowClick && onRowClick(business)}
            >
              <div className="absolute top-2 mx-auto px-2 w-full z-50 flex items-center justify-between">
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                    setBusinessToDelete(business?._id);
                  }}
                  className=" z-5 p-1 cursor-pointer rounded-full text-red-600 bg-white"
                  aria-label={`Delete ${business.name}`}
                >
                  <TrashIcon size={18} />
                </button>
                <span
                  className={clsx(
                    "inline-flex items-center px-3 py-1 rounded-lg text-sm text-white",
                    business?.status?.toLowerCase() === "approved"
                      ? "bg-blue-500/60"
                      : business?.status?.toLowerCase() === "pending"
                        ? "bg-yellow-500/60"
                        : business?.status?.toLowerCase() === "rejected"
                          ? "bg-red-500/60 "
                          : isDark
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-100 text-gray-600",
                  )}
                >
                  {t(business?.status) || business?.status || t("unknown")}
                </span>
              </div>

              <div className="relative h-36">
                {business?.images && business.images.length > 0 ? (
                  <ImageWithFallback
                    src={business.images[0].image}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-gray-400 to-teal-400 flex items-center justify-center">
                    <Image className="w-20 h-20 text-white/40" />
                  </div>
                )}
              </div>

              <div
                className={`p-5 ${
                  isDark
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-600"
                }`}
              >
                <h3
                  className={`${isDark ? "text-white" : "text-gray-600"} font-semibold text-lg mb-3 line-clamp-2 text-gray-900 dark:text-white`}
                >
                  {business.name}
                </h3>

                <div className="space-y-2 text-sm">
                  {business.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {business?.address?.country}, {business.address?.city}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-sm">
                  {business?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="truncate">{business.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <Loader className="w-10 h-10 animate-spin text-teal-600" />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={"delete_business"}
        message="delete_business_confirm"
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setBusinessToDelete(null);
        }}
        onConfirm={() => {
          if (!businessToDelete) return;
          handleBusinessDelete(businessToDelete);
          setIsConfirmOpen(false);
          setBusinessToDelete(null);
        }}
      />
    </div>
  );
}

export default BusinessGridView;
