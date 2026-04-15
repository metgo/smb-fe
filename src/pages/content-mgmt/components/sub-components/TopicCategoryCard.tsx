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

  const handleSelectIcon = (icon: string) => {
    setTemplateContent((prev) =>
      prev.map((template, tIndex) => {
        if (tIndex !== topicIndex) return template;
        return {
          ...template,
          groups: template.groups.map((grp, gIndex) => {
            if (gIndex !== categoryIndex) return grp;
            return { ...grp, icon };
          }),
        };
      }),
    );
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
    setTemplateContent((prev) =>
      prev.map((template, tIndex) => {
        if (tIndex !== topicIndex) return template;
        return {
          ...template,
          groups: template.groups.map((grp, gIndex) => {
            if (gIndex !== categoryIndex) return grp;
            return { ...grp, category: editValue };
          }),
        };
      }),
    );
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
    setTemplateContent((prev) =>
      prev.map((template, tIndex) => {
        if (tIndex !== topicIndex) return template;
        return {
          ...template,
          groups: template.groups.map((grp, gIndex) => ({
            ...grp,
            isPrimary: gIndex === categoryIndex,
          })),
        };
      }),
    );
  };

  const handleRemoveContent = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    setTemplateContent((prev) =>
      prev.map((template, tIndex) => {
        if (tIndex !== topicIndex) return template;
        return {
          ...template,
          groups: template.groups.map((grp, gIndex) => {
            if (gIndex !== categoryIndex) return grp;
            return {
              ...grp,
              contents: grp.contents.filter((c: any) => c._id !== contentId),
            };
          }),
        };
      }),
    );
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
                  title="Change icon"
                  className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    iconPickerOpen
                      ? isDark
                        ? "border-blue-400 bg-blue-900/40"
                        : "border-blue-400 bg-blue-50 "
                      : isDark
                        ? "border-gray-600 bg-gray-700/80 hover:border-gray-400 hover:bg-gray-600"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50",
                  )}
                >
                  {group.icon ? (
                    <img
                      src={group.icon.iconPath ?? group.icon}
                      alt={group.icon.iconAlt ?? "icon"}
                      className={clsx(
                        "w-12 h-12 object-contain",
                        !isDark && "invert",
                      )}
                    />
                  ) : (
                    <span
                      className={clsx(
                        "text-lg font-light leading-none",
                        isDark ? "text-gray-400" : "text-gray-400",
                      )}
                    >
                      +
                    </span>
                  )}
                </button>

                {iconPickerOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIconPickerOpen(false)}
                    />

                    {/* Picker panel */}
                    <div
                      className={clsx(
                        "absolute top-12 left-0 z-50 rounded-xl border shadow-2xl",
                        "w-72 overflow-hidden",
                        "animate-in fade-in slide-in-from-top-2 duration-150",
                        isDark
                          ? "bg-gray-900 border-gray-700 shadow-black/60"
                          : "bg-white border-gray-200 shadow-gray-300/60",
                      )}
                    >
                      {/* Panel header */}
                      <div
                        className={clsx(
                          "flex items-center justify-between px-3 py-2 border-b",
                          isDark
                            ? "border-gray-700 bg-gray-800/60"
                            : "border-gray-100 bg-gray-50",
                        )}
                      >
                        <span
                          className={clsx(
                            "text-xs font-semibold tracking-wide uppercase",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          Select Icon
                        </span>
                        <button
                          onClick={() => setIconPickerOpen(false)}
                          className={clsx(
                            "p-0.5 rounded transition-colors",
                            isDark
                              ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-200",
                          )}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Icon grid */}
                      <div className="p-2 max-h-56 overflow-y-auto">
                        <div className="grid grid-cols-7 gap-0.5">
                          {allIcons?.data?.map((icon: any) => {
                            const isSelected = group.icon?._id === icon._id;
                            return (
                              <button
                                key={icon._id}
                                onClick={() => handleSelectIcon(icon?.iconPath)}
                                title={icon.name}
                                className={clsx(
                                  "relative w-9 h-9 rounded-lg flex items-center justify-center",
                                  "transition-all duration-150",
                                  "hover:scale-110 active:scale-95",
                                  isSelected
                                    ? isDark
                                      ? "bg-blue-600/30 ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900"
                                      : "bg-blue-50 ring-2 ring-blue-400 ring-offset-1 ring-offset-white"
                                    : isDark
                                      ? "hover:bg-gray-700/80"
                                      : "hover:bg-gray-100",
                                )}
                              >
                                <img
                                  src={icon.iconPath}
                                  alt={icon.iconAlt}
                                  className={clsx(
                                    "w-12 h-12 object-contain transition-opacity",
                                    !isDark && "invert",
                                    isSelected
                                      ? "opacity-100"
                                      : "opacity-70 group-hover:opacity-100",
                                  )}
                                />
                                {isSelected && (
                                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-white dark:border-gray-900" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
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
              </div>
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
