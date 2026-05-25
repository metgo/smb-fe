import { toast } from "sonner";
import { useRef, useState } from "react";
import { Image, Loader, MapPin, Phone } from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDeleteBusinessMutation } from "@/store/api/businessMutationApi";
import { ConfirmDialog, GridCard } from "@/components/shared";

interface Business {
  _id: string;
  name: string;
  image?: string;
  images: { image: string }[];
  phoneNumber: string;
  address: { city: string; country: string; location: string };
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

  useInfiniteScroll({ ref: scrollRef, hasMore, isLoading, onLoadMore: next });

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
      className={`pb-6 pt-2 px-2 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-300"}`}
    >
      <div
        className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto mb-20"
        id="business-table-scroll"
        ref={scrollRef}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {data?.map((business) => (
            <GridCard
              key={business._id}
              image={business.images?.[0]?.image}
              imageAlt={business.name}
              fallbackIcon={Image}
              fallbackGradient="from-gray-300 to-teal-400"
              title={getLngWiseStr(
                language,
                business?.name,
                business?.nameHe,
                business?.nameAr,
              )}
              status={business?.status?.toLowerCase()}
              isChecked={selectedItems?.has(business._id) ?? false}
              onCheckChange={
                selectedItems ? () => toggleCheckBox(business._id) : undefined
              }
              onDelete={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
                setBusinessToDelete(business._id);
              }}
              onClick={() => onRowClick?.(business)}
              meta={[
                business?.address && {
                  icon: MapPin,
                  label: `${business.address.country}, ${business.address.city}`,
                },
                business?.phoneNumber && {
                  icon: Phone,
                  label: business.phoneNumber,
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

      <ConfirmDialog
        open={isConfirmOpen}
        title="delete_business"
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
