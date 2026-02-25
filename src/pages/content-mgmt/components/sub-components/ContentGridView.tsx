import { ImageWithFallback } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { getPlainTextFromRichText } from "@/helpers";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { X } from "lucide-react";
import { useRef, type RefObject } from "react";

interface Business {
  _id: string;
  name: string;
  shortDescription?: string;
}

interface Category {
  name: string;
  hebrewName?: string;
}

interface ContentGridViewProps {
  drag?: RefObject<HTMLDivElement>;
  handleContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  isBusinessLoading?: boolean;
  baseClasses?: string;
  logoSrc: string;
  logoAlt: string;
  isInCategory?: boolean;
  language?: any;
  onRemove?: (id: string) => void;
  fetchNextPage?: () => void;
  hasMore: any;
  business: Business;
  primaryCategory?: Category;
}

const ContentGridView = ({
  drag,
  handleClick,
  handleContextMenu,
  baseClasses = "",
  logoSrc,
  logoAlt,
  isInCategory,
  onRemove,
  business,
  language,
  primaryCategory,
  isBusinessLoading,
  fetchNextPage,
  hasMore,
}: ContentGridViewProps) => {
  const { isDark } = useThemeClasses();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isBusinessLoading,
    onLoadMore: fetchNextPage,
  });

  return (
    <div
      ref={drag}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`group rounded-lg overflow-hidden w-full ${baseClasses}`}
    >
      <div
        className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto"
        id="business-table-scroll"
        ref={scrollRef}
      >
        {" "}
        <div className="relative aspect-video">
          <ImageWithFallback
            src={logoSrc}
            alt={logoAlt}
            className="w-full h-full object-cover"
          />
          {isInCategory && onRemove && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(business._id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div
          className={`
          p-3 h-28
          ${
            isDark
              ? "bg-gray-900 border border-gray-700/50  text-gray-200"
              : "bg-white border border-gray-200  text-gray-800"
          }
        `}
        >
          {" "}
          <h4
            className={`
            font-medium truncate mb-1
            ${isDark ? "text-gray-100" : "text-gray-900"}
          `}
          >
            {" "}
            {business.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
            {business.shortDescription
              ? getPlainTextFromRichText(business.shortDescription)
              : "-"}{" "}
          </p>
          {primaryCategory && (
            <span className="inline-block px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">
              {language === "en"
                ? primaryCategory.name
                : primaryCategory?.hebrewName}
            </span>
          )}
          {/* <div>{getMatchedItems(categoryFilter, [primaryCategoryId])}</div> */}
        </div>
      </div>
    </div>
  );
};

export default ContentGridView;
