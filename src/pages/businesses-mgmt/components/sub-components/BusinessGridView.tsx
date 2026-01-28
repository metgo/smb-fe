import { useState } from "react";
import { AlertCircle, MapPin, Phone, TrashIcon } from "lucide-react";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { useDeleteBusinessMutation } from "@/store/api/businessMutationApi";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

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
  data: T[];
  onRowClick?: (item: T) => void;
  theme: "dark" | "light";
  refetch: () => void;
}

function BusinessGridView<T extends Business>({
  data,
  onRowClick,
  theme,
  refetch,
}: GridViewProps<T>) {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId") ?? ""; // fallback to empty string

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [deleteBusiness, { isLoading: isDeleting }] =
    useDeleteBusinessMutation();
  const handleBusinessDelete = async (businessId: string) => {
    const res = await deleteBusiness({ businessId });
    toast.success(res?.data?.message || "Business deleted successfully");
    refetch();
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle
          className={`w-16 h-16 mx-auto mb-4 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`}
        />
        <h3
          className={`text-lg mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {"no_businesses_found"}
        </h3>
        <p className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
          {"no_businesses_found_desc"}
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {data.map((business) => (
          <div
            key={business._id}
            className="bg-white dark:bg-gray-900 relative rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => onRowClick && onRowClick(business)}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onRowClick
                setIsConfirmOpen(true);
                setBusinessToDelete(businessId);
              }}
              className="absolute top-2 right-2 z-5 p-1 rounded-full text-red-600 bg-white"
              aria-label={`Delete ${business.name}`}
            >
              <TrashIcon size={16} />
            </button>

            <div className="relative h-36">
              {business?.images && business.images.length > 0 ? (
                <ImageWithFallback
                  src={business.images[0].image}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <AlertCircle className="w-20 h-20 text-white/40" />
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                {business.name}
              </h3>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {business.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">
                      {business?.address?.country}, {business.address?.city}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
