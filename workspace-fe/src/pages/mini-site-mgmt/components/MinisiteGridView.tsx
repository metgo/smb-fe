import clsx from "clsx";
import { useRef, useState } from "react";
import { AlertCircle, ExternalLink, TrashIcon } from "lucide-react";

import { getStatusColor } from "../mini-site.utils";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { toast } from "sonner";
import { useDeleteMiniSiteMutation } from "@/store/api/miniSiteMutation";

interface MiniSiteGridViewProps {
  data: ICampaign[] | undefined;
  onRowClick?: (item: ICampaign) => void;
  refetch: () => void;
  next?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  t: (key: string) => string;
}

export default function MinisiteGridView({
  data,
  onRowClick,
  refetch,
  next,
  hasMore,
  isLoading = false,
  t,
}: MiniSiteGridViewProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { isDark, textPrimary, textSecondary } = useThemeClasses();

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading,
    onLoadMore: next,
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteMiniSite, { isLoading: isDeleting }] =
    useDeleteMiniSiteMutation();
  const [miniSiteToDelete, setMiniSiteToDelete] = useState<string | null>(null);

  const handleMiniSiteDelete = async (id: string) => {
    const res = await deleteMiniSite({ id });
    toast.success(res?.data?.message || "Mini-site deleted successfully");
    refetch();
  };

  if (data?.length === 0) {
    return (
      <div className="flex flex-col overflow-hidden h-[calc(108vh-210px)]">
        <AlertCircle
          className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        />
        <h3
          className={`text-lg mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("no_mini_sites_found")}
        </h3>
        <p className={isDark ? "text-gray-500" : "text-gray-600"}>
          {t("no_mini_sites_found_desc")}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`py-6 px-4 ${isDark ? "bg-gray-900" : "bg-gray-100"} rounded-xl`}
    >
      <div
        className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto mb-20"
        ref={scrollRef}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
          {data?.map((site) => {
            return (
              <div
                key={site._id}
                className={clsx(
                  isDark ? "bg-gray-900" : "bg-white",
                  "relative rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer",
                )}
                onClick={() => onRowClick && onRowClick(site)}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                    setMiniSiteToDelete(site._id);
                  }}
                  className="absolute top-2 right-2 z-5 p-1 cursor-pointer rounded-full text-red-600 bg-white"
                  aria-label={`Delete ${site.name}`}
                >
                  <TrashIcon size={18} />
                </button>

                <div className="flex items-center gap-2 absolute top-1 left-1 z-50">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(
                      site.status,
                      isDark,
                    )}`}
                  >
                    {t(`${site.status}`)}
                  </span>
                </div>

                <div className="relative h-36">
                  {site?.logoPath ? (
                    <ImageWithFallback
                      src={site.logoPath}
                      alt={site.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                      <ExternalLink className="w-20 h-20 text-white/40" />
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
                    className={`${textPrimary} font-semibold text-lg mb-3 line-clamp-2`}
                  >
                    {site.name}
                  </h3>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`${textSecondary} font-mono`}>
                        {site.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={textSecondary}>
                        {site?.companyInfo?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={textPrimary}>
                        ₪{site.miniSite.amount ? site.miniSite.amount : "-"}{" "}
                        {t("vouchers")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("delete_mini_site")}
        message={t("delete_mini_site_confirm")}
        confirmText={t("delete")}
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setMiniSiteToDelete(null);
        }}
        onConfirm={() => {
          if (!miniSiteToDelete) return;
          handleMiniSiteDelete(miniSiteToDelete);
          setIsConfirmOpen(false);
          setMiniSiteToDelete(null);
        }}
      />
    </div>
  );
}
