import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DropResult,
} from "@hello-pangea/dnd";

import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
import SelectField from "@/components/form-fields/SelectField";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { hasDateTimeField } from "@/pages/punchpass-mgmt/utils";

type TCatalogueItem = IPunchPassPayload["catalogues"][number];

interface PunchPassCatalogueProps {
  t: (key: string) => string;
  formData: IPunchPassPayload;
  setFormData: (data: any) => void;
  errors: {
    catalogues?: string;
    catalogueName?: string;
  };
}

const CATALOGUE_TYPES: TCatalogueItem["type"][] = [
  "PRODUCT",
  "SERVICE",
  "CLASS",
  "EVENT",
  "OTHER",
];

const emptyCatalogueItem: TCatalogueItem = {
  name: "",
  type: "PRODUCT",
  quantity: undefined,
  dateTime: "",
  order: 0,
};

const hasName = (item: TCatalogueItem) => !!item.name?.trim();

const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
};

// Lock the dragged item to the vertical axis and keep it within `bounds`
const getDragStyle = (
  style: DraggableProvided["draggableProps"]["style"],
  bounds: DOMRect | null,
): CSSProperties | undefined => {
  if (!style || !("position" in style) || !style.transform || !bounds) {
    return style;
  }
  const match = style.transform.match(
    /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/,
  );
  if (!match) return style;

  const y = Number(match[2]);
  const minY = bounds.top - style.top;
  const maxY = bounds.bottom - style.height - style.top;
  const clampedY = Math.min(Math.max(y, minY), Math.max(minY, maxY));

  return { ...style, transform: `translate(0px, ${clampedY}px)` };
};

// Keep each catalogue's `order` in sync with its position in the list
const withOrder = (items: TCatalogueItem[]) =>
  items.map((item, index) => ({ ...item, order: index + 1 }));

const PunchPassCatalogue = ({
  t,
  errors,
  formData,
  setFormData,
}: PunchPassCatalogueProps) => {
  const {
    textSecondary,
    textPrimary,
    textTertiary,
    bgTertiary,
    borderColor,
    language,
  } = useThemeClasses();

  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const inputClasses = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`;

  const catalogues = formData.catalogues || [];

  // Accordion: only one catalogue is expanded at a time, the first by default
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [nameError, setNameError] = useState(false);

  // Publish validation flagged unnamed items — open the first one
  useEffect(() => {
    if (!errors.catalogueName) return;
    const unnamedIndex = (formData.catalogues || []).findIndex(
      (item) => !hasName(item),
    );
    if (unnamedIndex !== -1) setExpandedIndex(unnamedIndex);
    // Only react to a new validation result, not to every edit of the list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors.catalogueName]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const dragBoundsRef = useRef<DOMRect | null>(null);

  // The modal is transformed, which breaks `position: fixed` for the dragged
  // item, so it is portalled to <body> and clamped to the modal's scroll area
  const handleBeforeDragStart = () => {
    const scrollParent = getScrollParent(listRef.current);
    dragBoundsRef.current =
      scrollParent?.getBoundingClientRect() ??
      listRef.current?.getBoundingClientRect() ??
      null;
  };

  const toggleExpanded = (index: number) =>
    setExpandedIndex((prev) => (prev === index ? null : index));

  const updateCatalogue = (index: number, updates: Partial<TCatalogueItem>) => {
    if ("name" in updates) setNameError(false);
    setFormData((prev: any) => ({
      ...prev,
      catalogues: prev.catalogues.map((item: TCatalogueItem, i: number) =>
        i === index ? { ...item, ...updates } : item,
      ),
    }));
  };

  const addCatalogue = () => {
    // Every existing catalogue needs a name before another one can be added
    const unnamedIndex = catalogues.findIndex((item) => !hasName(item));
    if (unnamedIndex !== -1) {
      setExpandedIndex(unnamedIndex);
      setNameError(true);
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      catalogues: withOrder([
        ...(prev.catalogues || []),
        { ...emptyCatalogueItem },
      ]),
    }));
    setExpandedIndex(catalogues.length);
  };

  const removeCatalogue = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      catalogues: withOrder(
        prev.catalogues.filter((_: TCatalogueItem, i: number) => i !== index),
      ),
    }));
    setNameError(false);
    setExpandedIndex((prev) => {
      if (prev === null || prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination || source.index === destination.index) return;

    setFormData((prev: any) => {
      const reordered = [...prev.catalogues];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      return { ...prev, catalogues: withOrder(reordered) };
    });

    // Keep the expanded panel attached to the same catalogue after the move
    setExpandedIndex((prev) => {
      if (prev === null) return null;
      if (prev === source.index) return destination.index;
      if (source.index < prev && destination.index >= prev) return prev - 1;
      if (source.index > prev && destination.index <= prev) return prev + 1;
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-medium ${textSecondary}`}>
          {t("catalogues")} <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={addCatalogue}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("add_catalogue")}
        </button>
      </div>

      {errors.catalogues && (
        <p className="text-red-500 text-sm">{errors.catalogues}</p>
      )}

      {catalogues.length === 0 && (
        <div
          className={`rounded-xl border border-dashed ${borderColor} p-6 text-center text-sm ${textTertiary}`}
        >
          {t("no_catalogues_added")}
        </div>
      )}

      <DragDropContext
        onBeforeDragStart={handleBeforeDragStart}
        onDragEnd={handleDragEnd}
      >
        <Droppable droppableId="catalogues">
          {(droppableProvided) => (
            <div
              ref={(el) => {
                listRef.current = el;
                droppableProvided.innerRef(el);
              }}
              {...droppableProvided.droppableProps}
              className="space-y-4"
            >
              {catalogues.map((item, index) => {
                const isExpanded = expandedIndex === index;
                const itemName = item.name;
                const showNameError =
                  (nameError || !!errors.catalogueName) && !hasName(item);

                return (
                  <Draggable
                    key={(item as any)._id ?? `catalogue-${index}`}
                    draggableId={(item as any)._id ?? `catalogue-${index}`}
                    index={index}
                  >
                    {(
                      draggableProvided: DraggableProvided,
                      snapshot: DraggableStateSnapshot,
                    ) => {
                      const content = (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          style={
                            snapshot.isDragging
                              ? getDragStyle(
                                  draggableProvided.draggableProps.style,
                                  dragBoundsRef.current,
                                )
                              : draggableProvided.draggableProps.style
                          }
                          dir={dir}
                          className={`rounded-xl border ${borderColor} ${bgTertiary} ${snapshot.isDragging ? "shadow-lg" : ""}`}
                        >
                          <div className="flex items-center gap-2 p-4">
                            <span
                              {...draggableProvided.dragHandleProps}
                              className={`p-1 rounded cursor-grab active:cursor-grabbing ${textTertiary}`}
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleExpanded(index)}
                              className="flex flex-1 min-w-0 items-center gap-2 text-start cursor-pointer"
                            >
                              <span
                                className={`text-sm font-semibold ${textSecondary} truncate`}
                              >
                                {t("catalogue")} {index + 1}
                                {!isExpanded && itemName
                                  ? ` - ${itemName}`
                                  : ""}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 shrink-0 transition-transform ${textTertiary} ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeCatalogue(index)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4">
                              <FormFieldWrapper
                                label={t("catalogue_name")}
                                required
                              >
                                <input
                                  type="text"
                                  dir={dir}
                                  value={itemName || ""}
                                  onChange={(e) =>
                                    updateCatalogue(index, {
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder={t("catalogue_name_placeholder")}
                                  className={`${inputClasses} ${showNameError ? "border-red-500!" : ""}`}
                                />
                                {showNameError && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {nameError
                                      ? t("catalogue_name_required")
                                      : errors.catalogueName}
                                  </p>
                                )}
                              </FormFieldWrapper>

                              <FormFieldWrapper label={t("catalogue_type")}>
                                <SelectField
                                  value={item.type || "PRODUCT"}
                                  onChange={(value) =>
                                    updateCatalogue(index, {
                                      type: value as TCatalogueItem["type"],
                                    })
                                  }
                                  options={CATALOGUE_TYPES.map((type) => ({
                                    label: t(
                                      `catalogue_type_${type?.toLowerCase()}`,
                                    ),
                                    value: type as string,
                                  }))}
                                  placeholder={t("catalogue_type")}
                                  selectInputClasses={`${borderColor} ${bgTertiary} ${textPrimary}`}
                                />
                              </FormFieldWrapper>

                              <FormFieldWrapper label={t("catalogue_quantity")}>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity ?? ""}
                                  onChange={(e) =>
                                    updateCatalogue(index, {
                                      quantity:
                                        e.target.value === ""
                                          ? undefined
                                          : Number(e.target.value),
                                    })
                                  }
                                  placeholder="1"
                                  className={inputClasses}
                                />
                              </FormFieldWrapper>

                              {hasDateTimeField(item.type) && (
                                <FormFieldWrapper label={t("catalogue_time")}>
                                  <input
                                    type="datetime-local"
                                    value={item.dateTime?.slice(0, 16) || ""}
                                    onChange={(e) =>
                                      updateCatalogue(index, {
                                        dateTime: e.target.value,
                                      })
                                    }
                                    className={inputClasses}
                                  />
                                </FormFieldWrapper>
                              )}
                            </div>
                          )}
                        </div>
                      );

                      return snapshot.isDragging
                        ? createPortal(content, document.body)
                        : content;
                    }}
                  </Draggable>
                );
              })}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default PunchPassCatalogue;
