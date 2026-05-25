import { toast } from "sonner";
import { useRef, useState } from "react";
import { Image, Loader, MapPin } from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDeletePoiMutation } from "@/store/api/poiMutationApi";
import { ConfirmDialog, GridCard } from "@/components/shared";

interface GridViewProps {
  data: any[];
  onRowClick?: (item: any) => void;
  refetch: () => void;
  next?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  selectedItems?: Set<string>;
  setSelectedItems?: (v: Set<string>) => void;
}

export default function PoiGridView({
  data,
  onRowClick,
  refetch,
  hasMore,
  next,
  isLoading = false,
  selectedItems,
  setSelectedItems,
}: GridViewProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { isDark, language } = useThemeClasses();

  useInfiniteScroll({ ref: scrollRef, hasMore, isLoading, onLoadMore: next });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<string | null>(null);
  const [deletePoi, { isLoading: isDeleting }] = useDeletePoiMutation();

  const toggleCheckBox = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    if (setSelectedItems) setSelectedItems(newSelected);
  };

  const handlePoiDelete = async (poiId: string) => {
    const res = await deletePoi({ poiId });
    toast.success(res?.data?.message || "POI deleted successfully");
    refetch();
  };

  return (
    <div
      className={`pb-6 pt-2 px-2 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-300"}`}
    >
      <div
        className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto mb-20"
        ref={scrollRef}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {data?.map((poi) => (
            <GridCard
              key={poi._id}
              image={poi.images?.[0]?.image}
              imageAlt={poi.name}
              imageHeight="h-36"
              fallbackIcon={Image}
              fallbackGradient="from-gray-400 to-teal-400"
              title={getLngWiseStr(
                language,
                poi?.name,
                poi?.nameHe,
                poi?.nameAr,
              )}
              status={poi?.status?.toLowerCase()}
              isChecked={selectedItems?.has(poi._id) ?? false}
              onCheckChange={
                selectedItems ? () => toggleCheckBox(poi._id) : undefined
              }
              onDelete={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
                setPoiToDelete(poi._id);
              }}
              onClick={() => onRowClick?.(poi)}
              meta={[
                poi?.address && {
                  icon: MapPin,
                  label: `${poi.address.country}, ${poi.address.city}`,
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
        title="delete_poi"
        message="delete_poi_confirm"
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setPoiToDelete(null);
        }}
        onConfirm={() => {
          if (!poiToDelete) return;
          handlePoiDelete(poiToDelete);
          setIsConfirmOpen(false);
          setPoiToDelete(null);
        }}
      />
    </div>
  );
}
