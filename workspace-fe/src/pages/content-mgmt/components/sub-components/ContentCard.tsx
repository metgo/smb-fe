import { useDrag } from "react-dnd";
import { MapPin, X, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

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
  address?: {
    city: string;
    location?: string;
  };

  startDate?: string;
  startTime?: string;
  isFree?: boolean;
  eventType?: string;

  isExpanded?: boolean;
  viewMode?: TViewMode;
  isSelected?: boolean;
  isInCategory?: boolean;
  /** Item is already included in the currently loaded / active view */
  isInView?: boolean;

  // Map of all currently selected items (id → full business object).
  // Passed down from Contents so the drag item can carry ALL selected items.
  selectedItems?: Map<string, any>;
  contentType?: string;

  handleContextMenu?: () => void;
  handleClick?: (e: React.MouseEvent) => void;
  handleRemove?: (e: React.MouseEvent, v: string) => void;
}

const ContentCard = ({
  _id,
  name,
  image,
  categoryName,
  address,
  descripition,
  startDate,
  startTime,
  isFree,
  eventType,
  isInCategory,
  isInView,
  isExpanded,
  viewMode = "grid",
  isSelected,
  selectedItems,
  contentType,
  handleClick,
  handleRemove,
  handleContextMenu,
}: ContentCardProps) => {
  const { isDark, bgTertiary } = useThemeClasses();
  const { t } = useTranslation("content");

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BUSINESS_CARD,
    canDrag: !isInCategory,

    item: () => {
      // If this card is part of a multi-selection, carry ALL selected items.
      // Otherwise carry only this single card.
      if (isSelected && selectedItems && selectedItems.size > 1) {
        return {
          isMultiple: true,
          // Array of { _id, name, image, description, contentType } for each selected item
          items: Array.from(selectedItems.values()).map((b) => ({
            _id: b._id,
            name: b.name,
            image: b.images?.[0]?.image ?? "",
            description: b.shortDescription ?? "",
            contentType,
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
            contentType,
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
    ? "bg-teal-50 dark:bg-teal-950/30 border-teal-600 ring-2 ring-teal-400/50"
    : "bg-white border-gray-400 hover:border-gray-300 dark:hover:border-gray-600";

  const baseClasses = clsx(
    "cursor-grab active:cursor-grabbing transition-all border select-none",
    isDragging ? "opacity-40 scale-95" : "opacity-100",
    !isSelected && isInView && !isInCategory
      ? "ring-1 ring-teal-400/50"
      : undefined,
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

      {/* "Already in the active view" indicator */}
      {isInView && !isInCategory && (
        <div
          title={t("in_current_view")}
          className="absolute top-1 right-1 z-10 flex items-center justify-center rounded-full bg-teal-500 p-0.5 shadow ring-2 ring-white dark:ring-gray-900"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
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
            "px-2.5 py-2",
            isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800",
          )}
        >
          <h4
            className={clsx(
              "text-sm font-semibold truncate leading-tight",
              isDark ? "text-gray-100" : "text-gray-900",
            )}
          >
            {name}
          </h4>
          {descripition && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
              {getPlainTextFromRichText(descripition)}
            </p>
          )}
          {(categoryName || address?.city) && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {categoryName && (
                <span
                  className={clsx(
                    "inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded",
                    bgTertiary,
                  )}
                >
                  {categoryName}
                </span>
              )}
              {(address?.city || address?.location) && (
                <span
                  className={clsx(
                    "flex items-center gap-0.5 text-[10px] font-semibold",
                    isDark ? "text-gray-100" : "text-gray-900",
                  )}
                >
                  <MapPin className="w-2.5 h-2.5 text-red-500" />
                  {address.city || address.location}
                </span>
              )}
            </div>
          )}
          {(startDate || isFree !== undefined || eventType) && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {startDate && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <CalendarDays className="w-2.5 h-2.5" />
                  {new Date(startDate).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                  {startTime && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <Clock className="w-2.5 h-2.5" />
                      {startTime}
                    </span>
                  )}
                </span>
              )}
              {isFree !== undefined && (
                <span
                  className={clsx(
                    "px-1.5 py-0.5 text-[10px] font-semibold rounded",
                    isFree
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  )}
                >
                  {isFree ? "Free" : "Paid"}
                </span>
              )}
              {eventType && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {eventType.charAt(0) + eventType.slice(1).toLowerCase()}
                </span>
              )}
            </div>
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
        isExpanded ? "col-span-12" : "col-span-4",
      )}
    >
      <div className="flex h-14">
        {/* Thumbnail */}
        <div className="relative w-14 shrink-0">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          {cardContent}
        </div>

        {/* Content */}
        <div
          className={clsx(
            "flex-1 min-w-0 px-2.5 py-1.5 flex flex-col justify-center",
            isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800",
          )}
        >
          <div className="flex items-center gap-2">
            <h4
              className={clsx(
                "text-sm font-semibold truncate flex-1 leading-tight",
                isDark ? "text-gray-100" : "text-gray-900",
              )}
            >
              {name || "-"}
            </h4>
            {(categoryName || address?.city) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={clsx(
                    "shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap",
                    bgTertiary,
                  )}
                >
                  {categoryName}
                </span>
                {(address?.city || address?.location) && (
                  <span
                    className={clsx(
                      "shrink-0 flex items-center gap-0.5 text-[10px] font-semibold whitespace-nowrap",
                      isDark ? "text-gray-100" : "text-gray-900",
                    )}
                  >
                    <MapPin className="w-2.5 h-2.5 text-red-500" />
                    {address.city || address.location}
                  </span>
                )}
              </div>
            )}
          </div>
          {startDate || isFree !== undefined || eventType ? (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {startDate && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <CalendarDays className="w-2.5 h-2.5" />
                  {new Date(startDate).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                  {startTime && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <Clock className="w-2.5 h-2.5" />
                      {startTime}
                    </span>
                  )}
                </span>
              )}
              {isFree !== undefined && (
                <span
                  className={clsx(
                    "px-1.5 py-0.5 text-[10px] font-semibold rounded",
                    isFree
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  )}
                >
                  {isFree ? "Free" : "Paid"}
                </span>
              )}
              {eventType && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {eventType.charAt(0) + eventType.slice(1).toLowerCase()}
                </span>
              )}
            </div>
          ) : descripition ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
              {getPlainTextFromRichText(descripition)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
