import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPlainTextFromRichText } from "@/helpers";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";


interface ContentCardProps {
  _id: string;
  name: string;
  image: string;
  categoryName: string;
  descripition: string;
  drag: any;

  viewMode?: string;
  isSelected?: boolean;
  isDragging?: boolean;
  isInCategory?: boolean;

  handleContextMenu?: (v: string) => void;
  handleClick?: (e: any, v: string) => void;
  handleRemove?: (e: any, v: string) => void;

}


const ContentCard = ({
  _id,
  name,
  image,
  drag,
  categoryName,
  descripition,
  isInCategory,
  viewMode = "grid",
  isSelected,
  handleClick,
  handleRemove,
  isDragging,
  handleContextMenu,
}: ContentCardProps) => {

  const { isDark } = useThemeClasses();


  const selectionClasses = isSelected
    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/50"
    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";

  const draggingClasses = isDragging ? "opacity-50" : "opacity-100";

  const baseClasses = `
      cursor-pointer transition-all border
      ${draggingClasses}
      ${selectionClasses}
    `;

  return (
    <div
      ref={() => { drag }}
      onClick={(e) => { handleClick && handleClick(e, _id) }}
      onContextMenu={() => { handleContextMenu && handleContextMenu(_id) }}
      className={clsx(
        "group rounded-lg overflow-hidden w-full",
         baseClasses,
         viewMode==="grid" ? "sm:col-span-3 md:col-span-4":"col-span-12"
      )}
    >

      {viewMode === "grid" ?
        (<div >
          <div className="relative aspect-video">
            <ImageWithFallback
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
            {isInCategory && handleRemove && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => handleRemove(e, _id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div
            className={clsx(
              " p-3",
              isDark
                ? "bg-gray-900 border border-gray-700/50  text-gray-200"
                : "bg-white border border-gray-200  text-gray-800"
            )}
          >
            <h4
              className={clsx("font-medium truncate mb-1",
                isDark ? "text-gray-100" : "text-gray-900"
              )}
            >
              {name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
              {descripition
                ? getPlainTextFromRichText(descripition)
                : "-"}{" "}
            </p>
            {categoryName &&
              <span className="inline-block px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">{categoryName}</span>
            }
          </div>
        </div>) :
        (<div className="grid grid-cols-12 h-20">
          <div className="relative col-span-2">
            <ImageWithFallback
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
            {isInCategory && handleRemove && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => handleRemove(e, _id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div
            className={clsx(
              " p-3 col-span-10",
              isDark
                ? "bg-gray-900 border border-gray-700/50  text-gray-200"
                : "bg-white border border-gray-200  text-gray-800"
            )}
          >
            <h4
              className={clsx("font-medium truncate mb-1",
                isDark ? "text-gray-100" : "text-gray-900"
              )}
            >
              {name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
              {descripition
                ? getPlainTextFromRichText(descripition)
                : "-"}{" "}
            </p>
            {categoryName &&
              <span className="inline-block px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">{categoryName}</span>
            }
          </div>
        </div>)
      }

    </div>
  )
}

export default ContentCard