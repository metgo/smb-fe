import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { RefObject } from "react";
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
}: ContentListViewProps) => {
  const { isDark } = useThemeClasses();
  return (
    <div
      ref={drag}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={` xl:max-w-xl
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
      <div className="">
        <ImageWithFallback
          src={logoSrc}
          alt={logoAlt}
          className="w-12 h-12 object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={`
    font-medium truncate
    ${isDark ? "text-gray-100" : "text-gray-900"}
  `}
        >
          {" "}
          {business.name ? getPlainTextFromRichText(business.name) : "-"}{" "}
        </h4>

        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {business.shortDescription
            ? getPlainTextFromRichText(business.shortDescription)
            : "-"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {primaryCategory && (
          <span className="inline-block px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">
            {primaryCategory.name}
          </span>
        )}

        {isInCategory && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(business.id);
            }}
            className="opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContentListView;
