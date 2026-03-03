import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Image, Loader, MapPin, Phone } from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { DeleteIconBtn } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDeleteBusinessMutation } from "@/store/api/businessMutationApi";
import {
  ConfirmDialog,
  ImageWithFallback,
  ItemStatusBadge,
} from "@/components/shared";

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
  selectedItems?: Set<string>;
  setSelectedItems?: (v: Set<string>) => void;
}

function BusinessGridView<T extends Business>({
  data,
  onRowClick,
  refetch,
  hasMore,
  next,
  isLoading = false,
  selectedItems,
  setSelectedItems,
}: GridViewProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { isDark, language } = useThemeClasses();

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

  const toggleCheckBox = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    if (setSelectedItems) setSelectedItems(newSelected);
  };

  const handleBusinessDelete = async (businessId: string) => {
    const res = await deleteBusiness({ businessId });
    toast.success(res?.data?.message || "Business deleted successfully");
    refetch();
  };

  return (
    <div
      className={`pb-6 pt-2 px-2 ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-300 "
      } `}
    >
      <div
        className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto mb-20"
        id="business-table-scroll"
        ref={scrollRef}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data?.map((business) => {
            const isChecked = selectedItems?.has(business?._id) ?? false;

            return (
              <div
                key={business._id}
                onClick={() => onRowClick && onRowClick(business)}
                className={clsx(
                  `rounded-xl border-2 overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative`,
                  isDark
                    ? "bg-gray-900 text-gray-300"
                    : "bg-white text-gray-900",
                  isChecked ? "border-teal-500" : "border-gray-300",
                )}
              >
                <div
                  className="absolute top-3 left-0 z-30 w-full flex items-center justify-between px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    {selectedItems && (
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCheckBox(business?._id)}
                        className={clsx(
                          "cursor-pointer border-2 transition-colors border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500",
                        )}
                      />
                    )}
                    <ItemStatusBadge status={business?.status?.toLowerCase()} />
                  </div>

                  <div className="flex items-center gap-2">
                    <DeleteIconBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsConfirmOpen(true);
                        setBusinessToDelete(business?._id);
                      }}
                    />
                  </div>
                </div>

                <div className="relative h-40">
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
                  className={`p-2 ${
                    isDark
                      ? "bg-gray-800 text-gray-400"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <h3
                    className={`${isDark ? "text-white" : "text-gray-600"} font-semibold text-lg mb-3 line-clamp-2 text-gray-900 dark:text-white`}
                  >
                    {getLngWiseStr(
                      language,
                      business?.name,
                      business?.nameHe,
                      business?.nameAr,
                    )}
                  </h3>

                  <div className="space-y-2 text-sm">
                    {business?.address && (
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
                        <span className="truncate">
                          {business?.phoneNumber}
                        </span>
                      </div>
                    )}
                  </div>
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
