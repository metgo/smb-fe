import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { RefObject } from "react";

interface Business {
  _id: string;
  name: string;
  shortDescription?: string;
}

interface Category {
  name: string;
}

interface ContentGridViewProps {
  drag?: RefObject<HTMLDivElement>;
  handleContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  baseClasses?: string;
  logoSrc: string;
  logoAlt: string;
  isInCategory?: boolean;
  onRemove?: (id: string) => void;
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
  primaryCategory,
}: ContentGridViewProps) => {
  return (
    <div
      ref={drag}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`group rounded-lg overflow-hidden w-full ${baseClasses}`}
    >
      <div className="relative aspect-video">
        <img
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

      <div className="p-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
          {business.name}
        </h4>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
          {business.shortDescription}
        </p>

        {primaryCategory && (
          <span className="inline-block px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">
            {primaryCategory.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default ContentGridView;
