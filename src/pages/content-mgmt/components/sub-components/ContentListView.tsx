import { Button } from "@/components/ui/button";
import { Loader, X } from "lucide-react";
import { type RefObject } from "react";
import { getPlainTextFromRichText } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";

interface Business {
  id: string;
  name: string;
  shortDescription?: string;
}

interface Category {
  name: string;
  hebrewName?: string;
}

interface ContentListViewProps {
  drag?: RefObject<HTMLDivElement>;
  handleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  baseClasses?: string;
  logoSrc: string;
  logoAlt: string;
  business: Business;
  primaryCategory?: Category;
  isInCategory?: boolean;
  onRemove?: (id: string) => void;
  isBusinessLoading?: boolean;
  language?: any;
  fetchNextPage?: () => void;
  hasMore: any;
}

const ContentListView = ({
  drag,
  handleClick,
  handleContextMenu,
  logoSrc,
  logoAlt,
  business,
  primaryCategory,
  isInCategory,
  onRemove,
  isBusinessLoading,

  language,
}: ContentListViewProps) => {
  const { isDark } = useThemeClasses();

  return (
    <div
      ref={drag}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={` 
        group flex items-center gap-4 p-3 rounded-lg
        transition-colors duration-150 cursor-pointer
        ${
          isDark
            ? "bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-100"
            : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-900"
        }
        shadow-sm ${isDark ? "shadow-black/20" : "shadow-gray-100"}
      `}
    >
      <div>
        <div className="flex items-start gap-3 p-3 group">
          {" "}
          {/* Logo */}
          <div className="shrink-0">
            <ImageWithFallback
              src={logoSrc}
              alt={logoAlt}
              className="w-12 h-12 object-cover rounded-md"
            />
          </div>
          {/* Main content area - grows to fill space */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* Top row: Name + Category pill (aligned right) */}
            <div className="flex items-center justify-between gap-3">
              <h4
                className={`
            font-medium truncate
            ${isDark ? "text-gray-100" : "text-gray-900"}
          `}
              >
                {business.name ? getPlainTextFromRichText(business.name) : "—"}
              </h4>

              {primaryCategory && (
                <span
                  className={`
              inline-flex shrink-0 px-3 py-1 text-xs font-medium 
              text-gray-700 bg-gray-200 dark:text-gray-300 dark:bg-gray-700 
              rounded-full
            `}
                >
                  {language === "en"
                    ? primaryCategory.name
                    : primaryCategory?.hebrewName || primaryCategory.name}
                </span>
              )}
            </div>

            {/* Description - full width below */}
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {business.shortDescription
                ? getPlainTextFromRichText(business.shortDescription)
                : "—"}
            </p>
          </div>
          {/* Optional remove button - appears on hover */}
          {isInCategory && onRemove && (
            <div className="shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(business.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {isBusinessLoading && (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <Loader className="w-10 h-10 animate-spin text-teal-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentListView;
