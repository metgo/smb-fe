import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Image, Loader, Calendar, Eye } from "lucide-react";

import { getPlainTextFromRichText } from "@/helpers";
import { DeleteIconBtn } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
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
  refetch,
  hasMore,
  next,
  isLoading = false,
  selectedItems,
  setSelectedItems,
}: BlogGridViewProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { isDark, language } = useThemeClasses();

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isLoading,
    onLoadMore: next,
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  // const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const toggleCheckBox = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    if (setSelectedItems) setSelectedItems(newSelected);
  };

  // const handleBlogDelete = async (blogId: string) => {
  //   try {
  //     const res = await deleteBlog({ blogId });
  //     toast.success(res?.data?.message || "Article deleted successfully");
  //     refetch();
  //   } catch (error: any) {
  //     toast.error(error?.message || "Failed to delete article");
  //   }
  // };

  return (
    <div
      className={`pb-6 pt-2 px-2 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-300"}`}
    >
      <div
        className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto mb-20"
        id="blog-table-scroll"
        ref={scrollRef}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                <div className="relative h-48">
                  {firstImage ? (
                    <ImageWithFallback
                      src={firstImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                      <Image className="w-16 h-16 text-white/50" />
                    </div>
                  )}

                  {/* Image Count Badge */}
                  {blog.images && blog.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      {blog.images.length}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={`p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                  <h3
                    className={`font-semibold text-lg mb-2 line-clamp-2 leading-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {blog.title}
                  </h3>

                  {blog.subTitle && (
                    <p
                      className={`text-sm mb-3 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {blog.subTitle}
                    </p>
                  )}

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
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {blog.images?.length > 0 && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{blog.images.length} photos</span>
                      </div>
                    )}
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
            <p className="mt-3 text-sm text-gray-500">
              Loading more articles...
            </p>
          </div>
        )}

        {!isLoading && data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {/* <ConfirmDialog
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
      /> */}
    </div>
  );
};

export default BlogGridView;
