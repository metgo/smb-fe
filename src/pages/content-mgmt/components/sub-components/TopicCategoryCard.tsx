import clsx from "clsx";
import { toast } from "sonner";
import { useDrop } from "react-dnd";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  ChevronDown,
  Edit2,
  Eye,
  EyeClosed,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import ContentCard from "./ContentCard";

import { ConfirmDialog } from "@/components/shared";
import { useCommon } from "@/hooks/useCommon";

const ItemTypes = {
  BUSINESS_CARD: "business_card",
};

interface Props {
  group: any;
  topicIndex: number;
  categoryIndex: number;
  templateContents: IContentTemplate[];
  setTemplateContent: React.Dispatch<React.SetStateAction<IContentTemplate[]>>;
}

const TopicCategoryCard = ({
  group,
  topicIndex,
  categoryIndex,
  templateContents,
  setTemplateContent,
}: Props) => {
  const { isDark, bgTertiary, inputClasses } = useThemeClasses();
  const { t } = useTranslation("content");
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(group.category);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    topicIndex: number;
    categoryIndex: number;
  } | null>(null);

  const { allIcons } = useCommon();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const handleSelectIcon = (icon: IContentGroup["icon"]) => {
    const updated = [...templateContents];
    updated[topicIndex].groups[categoryIndex].icon = icon;
    setTemplateContent(updated);
    setIconPickerOpen(false);
  };

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.BUSINESS_CARD,

    drop: (item: any) => {
      const updated = [...templateContents];
      const category = updated[topicIndex].groups[categoryIndex];

      const existingIds = new Set(category.contents.map((c: any) => c._id));

      // Iterate over all dragged items (works for both single and multi)
      for (const draggedItem of item.items) {
        if (existingIds.has(draggedItem._id)) {
          toast.info(t("businesses_already_in_category"));
          continue;
        } // skip duplicates

        category.contents.push({
          _id: draggedItem._id,
          name: draggedItem.name || "",
          desc: draggedItem.description || "",
          imageUrl: draggedItem.image || "",
          primaryCategory: "",
          contentType: draggedItem.contentType || "business",
          title: draggedItem.title || draggedItem.name || "",
          message: draggedItem.message || "",
        });

        existingIds.add(draggedItem._id); // prevent double-add within the same drop
      }

      setTemplateContent(updated);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const requestDeleteCategory = (topicIdx: number, catIdx: number) => {
    setCategoryToDelete({ topicIndex: topicIdx, categoryIndex: catIdx });
    setIsConfirmOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    const { topicIndex, categoryIndex } = categoryToDelete;

    setTemplateContent((prev) => {
      const updated = [...prev];
      updated[topicIndex].groups.splice(categoryIndex, 1);
      return updated;
    });

    toast.success(t("category_deleted"));

    setIsConfirmOpen(false);
    setCategoryToDelete(null);
  };

  const renameCategory = () => {
    const updated = [...templateContents];
    updated[topicIndex].groups[categoryIndex].category = editValue;
    setTemplateContent(updated);
    setEditing(false);
  };

  const toggleCategoryVisibility = (
    templateIndex: number,
    groupIndex: number,
  ) => {
    setTemplateContent((prev: IContentTemplate[]) =>
      prev.map((template, tIndex) => {
        if (tIndex !== templateIndex) return template;

        return {
          ...template,
          groups: template.groups.map((group, gIndex) => {
            if (gIndex !== groupIndex) return group;

            return {
              ...group,
              isHideCategory: !group.isHideCategory,
            };
          }),
        };
      }),
    );
  };

  const togglePrimary = () => {
    const updated = [...templateContents];
    updated[topicIndex].groups = updated[topicIndex].groups.map((g, i) => ({
      ...g,
      isPrimary: i === categoryIndex,
    }));
    setTemplateContent(updated);
  };

  const handleRemoveContent = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    const updated = [...templateContents];
    updated[topicIndex].groups[categoryIndex].contents = updated[
      topicIndex
    ].groups[categoryIndex].contents.filter((c: any) => c._id !== contentId);
    setTemplateContent(updated);
  };

  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={(node) => {
        divRef.current = node;
        drop(node);
      }}
      className={clsx(
        "rounded-lg border transition-all",
        isDark
          ? "border-gray-300 bg-gray-800/50"
          : "border-gray-400 bg-gray-50",
        isOver && "ring-2 ring-blue-400 bg-blue-50/10",
      )}
    >
      {/* HEADER */}
      <div
        className={clsx(
          "flex items-center justify-between border border-gray-400 px-2 py-1 rounded-t-md",
          bgTertiary,
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className={clsx(
              "p-1 rounded",
              isDark
                ? "text-gray-100 hover:bg-gray-700"
                : "text-gray-800 hover:bg-gray-200",
            )}
          >
            <ChevronDown
              className={clsx(
                "w-4 h-4 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </Button>

          {editing ? (
            <>
              <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && renameCategory()}
                className={inputClasses}
              />
              <button
                onClick={renameCategory}
                className={clsx(
                  "p-1.5 rounded bg-green-400 text-white hover:shadow-md",
                )}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditValue(group.category);
                }}
                className={clsx("p-1.5 rounded bg-red-400 text-white")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Icon selector */}
              <div className="relative">
                <button
                  onClick={() => setIconPickerOpen((prev) => !prev)}
                  className={clsx(
                    "w-12 h-12 rounded border flex items-center justify-center",
                    isDark
                      ? "border-gray-600 bg-gray-700 "
                      : "border-gray-300  ",
                  )}
                >
                  {group.icon ? (
                    <img
                      src={group.icon}
                      alt={group.icon.iconAlt}
                      className="w-12 h-12 object-contain invert"
                    />
                  ) : (
                    <span className="text-xs text-white flex items-center">
                      +
                    </span>
                  )}
                </button>

                {iconPickerOpen && (
                  <div
                    className={clsx(
                      "absolute top-12 left-0 z-50 p-2 max-h-62 overflow-y-auto rounded-lg border shadow-md grid grid-cols-7  w-72",
                      isDark
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-200",
                    )}
                  >
                    {allIcons?.data?.map((icon: any) => (
                      <button
                        key={icon._id}
                        onClick={() =>
                          handleSelectIcon({
                            _id: icon._id,
                            name: icon.name,
                            iconPath: icon.iconPath,
                            iconAlt: icon.iconAlt,
                          })
                        }
                        className={clsx(
                          "w-12 h-12 rounded flex items-center justify-center gap-2 ",
                          isDark ? "" : "",
                          group.icon?._id === icon._id &&
                            "ring-2 ring-green-400 bg-green-300",
                        )}
                        title={icon.name}
                      >
                        <img
                          src={icon.iconPath}
                          alt={icon.iconAlt}
                          className="w-12 h-12 object-contain invert"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <h3
                className={clsx(
                  "text-lg font-semibold flex items-center gap-2 w-80",
                  isDark ? "text-gray-100" : "text-gray-900",
                )}
              >
                {group.category}
                {group.isPrimary && (
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                )}
              </h3>
              <span className="bg-gray-300 rounded-full w-6 h-6 text-center">
                {group.contents.length}
              </span>
            </>
          )}
        </div>

        <div className="flex">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(true)}
            title="Rename"
            className={clsx(
              isDark
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-500 hover:bg-gray-200",
            )}
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleCategoryVisibility(topicIndex, categoryIndex)}
            title="Visibility"
            className={clsx(
              isDark
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-500 hover:bg-gray-200",
            )}
          >
            {group.isHideCategory ? (
              <EyeClosed className="w-4 h-4 opacity-50" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePrimary}
            title="Set primary"
            className={clsx(
              isDark
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-500 hover:bg-gray-200",
            )}
          >
            <Star
              className={clsx(
                "w-4 h-4",
                group.isPrimary
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400 hover:bg-gray-200",
              )}
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => requestDeleteCategory(topicIndex, categoryIndex)}
            title="Delete"
            className={clsx(
              isDark
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-500 hover:bg-gray-200",
            )}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {expanded && (
        <div className="mt-4 px-2 pb-1">
          {group?.contents?.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
              {group.contents.map((content: any) => (
                <div key={content._id} className="w-44 shrink-0">
                  <ContentCard
                    _id={content._id}
                    name={content.name}
                    descripition={content.desc}
                    image={content.imageUrl}
                    categoryName=""
                    isInCategory
                    handleRemove={handleRemoveContent}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className={clsx(
                "w-full text-center py-18 border-2 border-dashed rounded-lg transition-colors mb-2",
                isOver
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700",
                "text-gray-400 dark:text-gray-500",
              )}
            >
              <p className="text-sm">
                {t("drag_businesses_here_to_add_them_to_this_category")}
              </p>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={isConfirmOpen}
        title={t("delete_category")}
        message={t("delete_category_confirm")}
        variant="danger"
        confirmText={t("delete")}
        onCancel={() => {
          setIsConfirmOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
};

export default TopicCategoryCard;
