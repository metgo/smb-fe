import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Image, Loader, MapPin } from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { DeleteIconBtn } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDeletePoiMutation } from "@/store/api/poiMutationApi";
import {
  ConfirmDialog,
  ImageWithFallback,
  ItemStatusBadge,
} from "@/components/shared";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data?.map((poi) => {
            const isChecked = selectedItems?.has(poi?._id) ?? false;
            return (
              <div
                key={poi._id}
                onClick={() => onRowClick && onRowClick(poi)}
                className={clsx(
                  "rounded-xl border-2 overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative",
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
                        onCheckedChange={() => toggleCheckBox(poi?._id)}
                        className="cursor-pointer border-2 transition-colors border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                      />
                    )}
                    <ItemStatusBadge status={poi?.status?.toLowerCase()} />
                  </div>
                  <DeleteIconBtn
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmOpen(true);
                      setPoiToDelete(poi?._id);
                    }}
                  />
                </div>

                <div className="relative h-40">
                  {poi?.images?.length > 0 ? (
                    <ImageWithFallback
                      src={poi.images[0].image}
                      alt={poi.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-400 to-teal-400 flex items-center justify-center">
                      <Image className="w-20 h-20 text-white/40" />
                    </div>
                  )}
                </div>

                <div
                  className={`p-2 ${isDark ? "bg-gray-800 text-gray-400" : "bg-white text-gray-600"}`}
                >
                  <h3
                    className={`${isDark ? "text-white" : "text-gray-600"} font-semibold text-lg mb-3 line-clamp-2`}
                  >
                    {getLngWiseStr(
                      language,
                      poi?.name,
                      poi?.nameHe,
                      poi?.nameAr,
                    )}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {poi?.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {poi?.address?.country}, {poi.address?.city}
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
