import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Image, Loader } from "lucide-react";

import { DeleteIconBtn } from "@/components/btns";
import { getPlainTextFromRichText } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDeleteBlogMutation } from "@/store/api/blogMutationApi";
import {
  ConfirmDialog,
  ImageWithFallback,
  ItemStatusBadge,
} from "@/components/shared";

interface Blog {
  _id: string;
  title: string;
  subTitle?: string;
  content?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  images: {
    image: string;
    caption?: string;
  }[];
  slug?: string;
}

interface BlogGridViewProps {
  data: any[];
  onRowClick?: (item: Blog) => void;
  refetch: () => void;
  next?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  selectedItems?: Set<string>;
  setSelectedItems?: (v: Set<string>) => void;
}

const BlogGridView = ({
  data,
  onRowClick,
  hasMore,
  next,
  refetch,
  isLoading = false,
  selectedItems,
  setSelectedItems,
}: BlogGridViewProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation("article");
  const { isDark } = useThemeClasses();

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isLoading,
    onLoadMore: next,
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const toggleCheckBox = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    if (setSelectedItems) setSelectedItems(newSelected);
  };

  const handleBlogDelete = async (blogId: string) => {
    try {
      const res = await deleteBlog({ blogId });
      toast.success(res?.data?.message || "Article deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete article");
    }
  };

  return (
    <div
      className={`pb-6 pt-2 px-2 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-300"}`}
    >
      <div
        ref={scrollRef}
        id="blog-table-scroll"
        className="overflow-x-auto max-h-[calc(100vh-250px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto mb-20"
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
          {data?.map((blog) => {
            const isChecked = selectedItems?.has(blog?._id) ?? false;
            const firstImage = blog?.images?.[0]?.image;
            const contentPreview = blog.content
              ? getPlainTextFromRichText(blog.content).slice(0, 120) + "..."
              : "";

            return (
              <div
                key={blog._id}
                onClick={() => onRowClick && onRowClick(blog)}
                className={clsx(
                  `rounded-xl border-2 overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative`,
                  isDark
                    ? "bg-gray-900 text-gray-300"
                    : "bg-white text-gray-900",
                  isChecked ? "border-teal-500" : "border-gray-300",
                )}
              >
                {/* Top Bar - Checkbox + Status + Delete */}
                <div
                  className="absolute top-3 left-0 right-0 z-30 flex items-center justify-between px-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    {selectedItems && (
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCheckBox(blog?._id)}
                        className={clsx(
                          "cursor-pointer border-2 transition-colors border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500",
                        )}
                      />
                    )}
                    <ItemStatusBadge status={blog?.status?.toLowerCase()} />
                  </div>

                  <DeleteIconBtn
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmOpen(true);
                      setBlogToDelete(blog?._id);
                    }}
                  />
                </div>

                {/* Image Section */}
                <div className="relative h-30 sm:h-40 md:h-48">
                  {firstImage ? (
                    <ImageWithFallback
                      src={firstImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                      <Image className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div
                  className={`p-3 sm:p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}
                >
                  <h3
                    className={`font-semibold text-base sm:text-lg mb-2 line-clamp-1 leading-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {blog.title}
                  </h3>
                  <h3
                    className={`font-medium text-sm mb-2 line-clamp-1 leading-tight ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {blog.shortDescription}
                  </h3>
                  <div className="mb-2">
                    {blog?.externalApiId ? (
                      <a
                        href={blog?.externalApiId?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 ml-2 text-sm text-gray-700 w-fit"
                      >
                        <img
                          src={blog?.externalApiId?.logo}
                          alt={blog?.externalApiId?.name}
                          className="w-6 h-6 object-contain rounded"
                        />
                        <span className="font-medium hover:underline">
                          {blog?.externalApiId?.name}
                        </span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <span className=""></span>
                    )}{" "}
                  </div>

                  {/* Preview Text */}
                  {contentPreview && (
                    <p
                      className={`text-xs mb-4 line-clamp-3 ${isDark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {contentPreview}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-gray-500">
                      {t("created_at")}
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-10 h-10 animate-spin text-violet-600" />
            <p className="mt-3 text-sm text-gray-500">{t("loading_more")}</p>
          </div>
        )}

        {!isLoading && data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("no_articles_found")}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setBlogToDelete(null);
        }}
        onConfirm={() => {
          if (blogToDelete) {
            handleBlogDelete(blogToDelete);
          }
          setIsConfirmOpen(false);
          setBlogToDelete(null);
        }}
      />
    </div>
  );
};

export default BlogGridView;
