import { Button } from "@/components/ui/button";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Badge, Check, ChevronDown, Edit2, MoreVertical, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";


interface Category {
  id: string;
  name: string;
  businessIds: string[];
  description: string;
}

const ItemTypes = {
  BUSINESS_CARD: "business_card",
};

type ViewMode = "grid" | "list";

interface CategoryContentSectionProps {
  category: Category;
  businesses: any;
  language?: any;
  selectedIds: Set<string>;
  onSelect: (id: string, isMulti: boolean) => void;
  onRemove: (businessId: string) => void;
  categories: Category[];
  onAddToCategory: (businessId: string, categoryId: string) => void;
  onRename: (categoryId: string, newName: string) => void;
  onDelete: (categoryId: string) => void;
  viewMode: ViewMode;
  isBusinessLoading?: boolean;
  onClearSelection?: () => void;
}



const CategoryContentSection = ({
  category,
  businesses,
  selectedIds,
  onSelect,
  onRemove,
  language,
  categories,
  onAddToCategory,
  onRename,
  onDelete,
  onClearSelection,
}: CategoryContentSectionProps) => {
  const { isDark, isRTL } = useThemeClasses();
  const { t } = useTranslation("businesses");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.name);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef =useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.BUSINESS_CARD,
    drop: (item: { ids: string[]; isMultiple: boolean; count: number }) => {
      const newBusinessIds = item?.ids?.filter(
        (id) => !category.businessIds.includes(id),
      );
      newBusinessIds.forEach((id) => {
        onAddToCategory(id, category.id);
      });
      if (newBusinessIds.length > 0) {
        toast.success(
          newBusinessIds?.length === 1
            ? t("business_added_to_category")
            : t("businesses_added_to_category", {
              count: newBusinessIds?.length,
            }),
        );
        onClearSelection?.();
      } else if (item?.ids?.length > 0) {
        toast.info(t("businesses_already_in_category"));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleRename = () => {
    if (editValue.trim() && editValue !== category.name) {
      onRename(category.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const categoryBusinesses = businesses?.filter((b: any) =>
    category?.businessIds?.includes(b._id),
  );

  return (
    <div
      ref={()=>{drop}}
      className={`
    rounded-lg border p-4 transition-all duration-200
    ${isOver
          ? isDark
            ? "border-teal-500 bg-teal-950/30 text-gray-100"
            : "border-teal-400 bg-teal-50/60 text-gray-900"
          : isDark
            ? "border-gray-700 bg-gray-800/50 text-gray-400"
            : "border-gray-200 bg-gray-50 text-gray-700"
        }
  `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? "" : isRTL ? "rotate-90" : "-rotate-90"
                }`}
            />
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setEditValue(category.name);
                    setIsEditing(false);
                  }
                }}
                className="h-8"
                autoFocus
              />
              <Button size="sm" onClick={handleRename}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditValue(category.name);
                  setIsEditing(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <h3
                className={`
    text-lg font-semibold
    ${isDark ? "text-gray-400" : "text-gray-900"}
  `}
              >
                {category.name}
              </h3>
              <Badge>{categoryBusinesses?.length}</Badge>
            </>
          )}
        </div>

        {!isEditing && (
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className={`
              hover:bg-gray-200      ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}
              ${isDark ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-900"}
              focus-visible:outline-none focus-visible:ring-2 
              ${isDark ? "focus-visible:ring-gray-500/50" : "focus-visible:ring-gray-400/50"}
            `}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showMenu && (
              <div
                className={`
                    absolute top-8 z-9999 
                    min-w-45 
                    rounded-md shadow-lg
                    border ${isRTL ? "left-0" : "right-0"}
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                  `}
              >
                <div className="py-1">
                  <button
                    className={`
                      w-full flex items-center px-4 py-2 text-sm
                      cursor-pointer transition-colors duration-150
                      ${isDark
                        ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100 active:bg-gray-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                      }
                    `}
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    <Edit2
                      className={`w-4 h-4 mr-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    />
                    {t("rename_category")}{" "}
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(category.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("delete_category")}{" "}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          {categoryBusinesses?.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-sm">
                Drag businesses here to add them to this category
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto max-w-[98vw]">
                <div className="flex gap-4 ">
                  {categoryBusinesses?.map((business: any) => (
                    <div key={business.id} className="w-64 shrink-0">
                    {/* Business Card */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CategoryContentSection
