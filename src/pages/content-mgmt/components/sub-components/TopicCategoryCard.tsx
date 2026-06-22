import clsx from "clsx";
import { toast } from "sonner";
import { useDrop } from "react-dnd";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronDown,
  Eye,
  EyeClosed,
  Loader2,
  MoreVertical,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useAiSuggestCategoryEntitiesMutation,
  type IAiSuggestedEntity,
} from "@/store/api/contentMutationApi";
import ColorPickerField from "./ColorPickerField";
import ContentCard from "./ContentCard";

import { ConfirmDialog } from "@/components/shared";
import { LUCIDE_ICONS } from "../../utils/lucideIcons";
import AiReviewModal from "../AiReviewModal";

const ItemTypes = {
  BUSINESS_CARD: "business_card",
};

interface Props {
  group: any;
  topicIndex: number;
  categoryIndex: number;
  externalApiId?: string | null;
  templateContents: IContentTemplate[];
  setTemplateContent: React.Dispatch<React.SetStateAction<IContentTemplate[]>>;
}

const TopicCategoryCard = ({
  group,
  topicIndex,
  categoryIndex,
  externalApiId,
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

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [aiSuggestEntities, { isLoading: isAiLoading }] =
    useAiSuggestCategoryEntitiesMutation();
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiBusinesses, setAiBusinesses] = useState<IAiSuggestedEntity[]>([]);
  const [aiProducts, setAiProducts] = useState<IAiSuggestedEntity[]>([]);

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const iconPanelRef = useRef<HTMLDivElement>(null);
  const iconPopupId = useRef(Math.random().toString(36));
  const [iconPopupPos, setIconPopupPos] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  // Close icon picker on outside click — check both trigger and portal panel
  useEffect(() => {
    if (!iconPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(e.target as Node) &&
        iconPanelRef.current &&
        !iconPanelRef.current.contains(e.target as Node)
      )
        setIconPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [iconPickerOpen]);

  // Close icon picker when another popup opens elsewhere
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail.id !== iconPopupId.current)
        setIconPickerOpen(false);
    };
    document.addEventListener("popup-opened", handler);
    return () => document.removeEventListener("popup-opened", handler);
  }, []);

  // Calculate fixed portal position — works for both LTR and RTL
  useEffect(() => {
    if (!iconPickerOpen) {
      setIconPopupPos(null);
      return;
    }
    const raf = requestAnimationFrame(() => {
      if (!iconPickerRef.current) return;
      const rect = iconPickerRef.current.getBoundingClientRect();
      const PANEL_W = 288; // w-72
      const top = rect.bottom + 4;
      if (rect.left + PANEL_W > window.innerWidth - 8) {
        setIconPopupPos({ top, right: window.innerWidth - rect.right });
      } else {
        setIconPopupPos({ top, left: rect.left });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [iconPickerOpen]);

  const openIconPicker = () => {
    setIconPickerOpen((prev) => {
      if (!prev)
        document.dispatchEvent(
          new CustomEvent("popup-opened", {
            detail: { id: iconPopupId.current },
          }),
        );
      return !prev;
    });
  };

  const handleColorChange = (colors: string[]) => {
    setTemplateContent((prev) =>
      prev.map((template, tIndex) => {
        if (tIndex !== topicIndex) return template;
        return {
          ...template,
          groups: template.groups.map((grp, gIndex) => {
            if (gIndex !== categoryIndex) return grp;
            return { ...grp, colors };
          }),
        };
      }),
    );
  };

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

  const handleAiAutoFill = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const categoryName = group.category?.trim();
    const categoryDescription =
      group.description?.trim() || group.category?.trim() || "";

    if (!categoryName) {
      toast.error("Please name this category before using AI auto fill.");
      return;
    }

    try {
      const result = await aiSuggestEntities({
        categoryName,
        categoryDescription,
        externalApiId: externalApiId ?? undefined,
      }).unwrap();

      const existingIds = new Set(
        group.contents.map((item: IContent) => item._id),
      );
      const businesses = result.businesses.filter(
        (item) => !existingIds.has(item._id),
      );
      const products = result.products.filter(
        (item) => !existingIds.has(item._id),
      );

      if (!businesses.length && !products.length) {
        toast.info("AI found no new matching entities for this category.");
        return;
      }

      setAiBusinesses(businesses);
      setAiProducts(products);
      setShowAiModal(true);
    } catch {
      toast.error("AI suggestion failed. Please try again.");
    }
  };

  const handleAiModalConfirm = (
    selectedBusinesses: IAiSuggestedEntity[],
    selectedProducts: IAiSuggestedEntity[],
  ) => {
    const nextContents: IContent[] = [
      ...selectedBusinesses.map((business) => ({
        _id: business._id,
        name: business.name,
        desc: business.description,
        imageUrl: business.images?.[0]?.image || "",
        primaryCategory: "",
        contentType: "business" as const,
        title: business.name,
        message: business.description,
      })),
      ...selectedProducts.map((product) => ({
        _id: product._id,
        name: product.name,
        desc: product.description,
        imageUrl: product.images?.[0]?.image || "",
        primaryCategory: "",
        contentType: "product" as const,
        title: product.name,
        message: product.description,
      })),
    ];

    if (!nextContents.length) {
      setShowAiModal(false);
      return;
    }

    setTemplateContent((prev) =>
      prev.map((template, tIndex) => {
        if (tIndex !== topicIndex) return template;
        return {
          ...template,
          groups: template.groups.map((grp, gIndex) => {
            if (gIndex !== categoryIndex) return grp;
            const existingIds = new Set(grp.contents.map((item) => item._id));
            return {
              ...grp,
              contents: [
                ...grp.contents,
                ...nextContents.filter((item) => !existingIds.has(item._id)),
              ],
            };
          }),
        };
      }),
    );
    setShowAiModal(false);
    toast.success("AI suggestions added to the category.");
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
              <div className="flex items-center gap-1.5">
                <div ref={iconPickerRef} className="relative">
                  <button
                    onClick={openIconPicker}
                    title="Change icon"
                    className={clsx(
                      "w-7 h-7 rounded flex items-center justify-center transition-all duration-200",
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
                    {(() => {
                      const found = LUCIDE_ICONS.find(
                        ({ name }) => name === group.icon,
                      );
                      if (!found)
                        return (
                          <span className="text-lg font-light text-gray-400">
                            +
                          </span>
                        );
                      return (
                        <found.Icon
                          className={clsx(
                            "w-5 h-5",
                            isDark ? "text-gray-200" : "text-gray-700",
                          )}
                        />
                      );
                    })()}
                  </button>

                  {iconPickerOpen &&
                    iconPopupPos &&
                    createPortal(
                      <div
                        ref={iconPanelRef}
                        style={{
                          position: "fixed",
                          top: iconPopupPos.top,
                          left: iconPopupPos.left,
                          right: iconPopupPos.right,
                          zIndex: 9999,
                        }}
                        className={clsx(
                          "rounded-xl border shadow-2xl",
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
                            {t("select_icon")}
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
                            {LUCIDE_ICONS.map(({ name, Icon }) => {
                              const isSelected = group.icon === name;
                              return (
                                <button
                                  key={name}
                                  onClick={() => handleSelectIcon(name)}
                                  title={name}
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
                                  <Icon
                                    className={clsx(
                                      "w-5 h-5 transition-opacity",
                                      isDark
                                        ? "text-gray-200"
                                        : "text-gray-700",
                                      isSelected ? "opacity-100" : "opacity-60",
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
                      </div>,
                      document.body,
                    )}
                </div>

                <ColorPickerField
                  title={group.category}
                  colors={group.colors ?? []}
                  onChange={handleColorChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <h3
                  onClick={() => setEditing(true)}
                  className={clsx(
                    "text-lg font-semibold flex items-center gap-2 w-80 cursor-pointer rounded px-1 -mx-1 transition-colors",
                    isDark
                      ? "text-gray-100 hover:bg-gray-700/60"
                      : "text-gray-900 hover:bg-gray-200/60",
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
                <div className="relative group/ai">
                  <button
                    type="button"
                    title="Auto Fill with AI"
                    aria-label="Auto Fill with AI"
                    onClick={handleAiAutoFill}
                    disabled={isAiLoading}
                    className={clsx(
                      "h-7 w-7 rounded-md border flex items-center justify-center transition-colors",
                      isAiLoading
                        ? isDark
                          ? "border-gray-700 text-gray-500 cursor-wait"
                          : "border-gray-200 text-gray-400 cursor-wait"
                        : isDark
                          ? "border-purple-600/70 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400"
                          : "border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-500",
                    )}
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div
                    className={clsx(
                      "absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover/ai:opacity-100 pointer-events-none transition-opacity z-20",
                      isDark
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-800 text-white",
                    )}
                  >
                    Auto Fill with AI
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu((v) => !v)}
            className={clsx(
              "h-7 w-7 p-0 rounded-md transition-colors",
              isDark
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {showMenu && (
            <div
              className={clsx(
                "absolute right-0 top-8 z-50 w-44 rounded-lg border shadow-lg overflow-hidden",
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200",
              )}
            >
              <button
                className={clsx(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
                onClick={() => {
                  toggleCategoryVisibility(topicIndex, categoryIndex);
                  setShowMenu(false);
                }}
              >
                {group.isHideCategory ? (
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <EyeClosed className="w-3.5 h-3.5 shrink-0" />
                )}
                {group.isHideCategory ? t("show_category") : t("hide_category")}
              </button>

              <button
                className={clsx(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
                onClick={() => {
                  togglePrimary();
                  setShowMenu(false);
                }}
              >
                <Star
                  className={clsx(
                    "w-3.5 h-3.5 shrink-0",
                    group.isPrimary
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400",
                  )}
                />
                {group.isPrimary
                  ? t("unset_primary_category")
                  : t("set_primary_category")}
              </button>

              <div
                className={clsx(
                  "mx-3 my-1 h-px",
                  isDark ? "bg-gray-700" : "bg-gray-100",
                )}
              />

              <button
                className={clsx(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  isDark
                    ? "text-red-400 hover:bg-gray-700 hover:text-red-300"
                    : "text-red-600 hover:bg-red-50 hover:text-red-700",
                )}
                onClick={() => {
                  setShowMenu(false);
                  requestDeleteCategory(topicIndex, categoryIndex);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                {t("delete_category")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      {expanded && (
        <div className="mt-4 px-2 pb-1">
          {group?.contents?.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
              {group.contents.map((content: any) => {
                return (
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
                );
              })}
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
      <AiReviewModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        categoryName={group.category}
        suggestedBusinesses={aiBusinesses}
        suggestedProducts={aiProducts}
        onConfirm={handleAiModalConfirm}
      />
    </div>
  );
};

export default TopicCategoryCard;
