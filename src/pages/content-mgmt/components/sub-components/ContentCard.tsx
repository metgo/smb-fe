import { useDrag } from "react-dnd";
import { X } from "lucide-react";
import clsx from "clsx";

import { getPlainTextFromRichText } from "@/helpers";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const ItemTypes = {
  BUSINESS_CARD: "business_card",
};

interface ContentCardProps {
  _id: string;
  name: string;
  image: string;
  categoryName: string;
  descripition: string;

  isExpanded?: boolean;
  viewMode?: TViewMode;
  isSelected?: boolean;
  isInCategory?: boolean;

  // Map of all currently selected items (id → full business object).
  // Passed down from Contents so the drag item can carry ALL selected items.
  selectedItems?: Map<string, any>;

  handleContextMenu?: () => void;
  handleClick?: (e: React.MouseEvent) => void;
  handleRemove?: (e: React.MouseEvent, v: string) => void;
}

const ContentCard = ({
  _id,
  name,
  image,
  categoryName,
  descripition,
  isInCategory,
  isExpanded,
  viewMode = "grid",
  isSelected,
  selectedItems,
  handleClick,
  handleRemove,
  handleContextMenu,
}: ContentCardProps) => {
  const { isDark } = useThemeClasses();

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BUSINESS_CARD,
    canDrag: !isInCategory,

    item: () => {
      // If this card is part of a multi-selection, carry ALL selected items.
      // Otherwise carry only this single card.
      if (isSelected && selectedItems && selectedItems.size > 1) {
        return {
          isMultiple: true,
          // Array of { _id, name, image, description } for each selected item
          items: Array.from(selectedItems.values()).map((b) => ({
            _id: b._id,
            name: b.name,
            image: b.images?.[0]?.image ?? "",
            description: b.shortDescription ?? "",
          })),
          count: selectedItems.size,
        };
      }

      // Single drag
      return {
        isMultiple: false,
        items: [
          {
            _id,
            name,
            image,
            description: descripition,
          },
        ],
        count: 1,
      };
    },

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const selectionClasses = isSelected
    ? "bg-teal-50 dark:bg-teal-950/30 border-teal-400 dark:border-teal-600 ring-2 ring-teal-400/50"
    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";

  const baseClasses = clsx(
    "cursor-grab active:cursor-grabbing transition-all border select-none",
    isDragging ? "opacity-40 scale-95" : "opacity-100",
    selectionClasses,
  );

  const cardContent = (
    <>
      {/* Selection badge for multi-select */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shadow">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {isInCategory && handleRemove && (
        <button
          onClick={(e) => handleRemove(e, _id)}
          className="absolute bg-red-500/80 p-1 top-1 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity rounded text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </>
  );

  if (viewMode === "grid") {
    return (
      <div
        ref={(node) => {
          drag(node);
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={clsx(
          "rounded-lg group overflow-hidden w-full relative",
          baseClasses,
          isExpanded ? "col-span-4" : "col-span-3",
        )}
      >
        <div className="relative aspect-video">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          {cardContent}
        </div>
        <div
          className={clsx(
            "px-3 py-4",
            isDark
              ? "bg-gray-900 border border-gray-700/50 text-gray-200"
              : "bg-white border border-gray-200 text-gray-800",
          )}
        >
          <h4
            className={clsx(
              "font-medium truncate mb-1",
              isDark ? "text-gray-100" : "text-gray-900",
            )}
          >
            {name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
            {descripition ? getPlainTextFromRichText(descripition) : "-"}
          </p>
          {categoryName && (
            <span className="inline-block px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">
              {categoryName}
            </span>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      ref={(node) => {
        drag(node);
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={clsx(
        "group rounded-lg overflow-hidden w-full relative",
        baseClasses,
        isExpanded ? "col-span-12" : "col-span-6",
      )}
    >
      <div className="grid grid-cols-12 h-26">
        <div className="relative col-span-2">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          {cardContent}
        </div>
        <div
          className={clsx(
            "p-3 col-span-10",
            isDark
              ? "bg-gray-900 border border-gray-700/50 text-gray-200"
              : "bg-white border border-gray-200 text-gray-800",
          )}
        >
          <h4
            className={clsx(
              "font-medium truncate mb-1",
              isDark ? "text-gray-100" : "text-gray-900",
            )}
          >
            {name ? name : "-"}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
            {descripition ? getPlainTextFromRichText(descripition) : "-"}
          </p>
          {categoryName && (
            <span className="inline-block px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">
              {categoryName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
