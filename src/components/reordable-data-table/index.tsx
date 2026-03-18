import clsx from "clsx";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { GripVertical, Loader2 } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

import { compareValues } from "@/helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import SortIcon from "./SortIcon";
import EmptyState from "./EmptyState";
import SkeletonRow from "./SkeletonRow";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: keyof T | "checkbox" | "actions" | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  storageKey?: string;
  onRowClick?: (item: T) => void;
  selectedItems?: Set<any>;
  onSelectionChange?: (selected: Set<any>) => void;
  rowKey: keyof T;
  isDataLoading?: boolean;
  next?: () => void;
  hasMore?: boolean;
  t?: (key: string) => string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PINNED_LEFT = new Set(["checkbox"]);
const PINNED_RIGHT = new Set(["actions"]);
const PINNED_ALL = new Set([...PINNED_LEFT, ...PINNED_RIGHT]);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReordableDataTable<T extends Record<string, any>>({
  t,
  data,
  next,
  columns,
  rowKey,
  hasMore,
  onRowClick,
  selectedItems,
  onSelectionChange,
  isDataLoading = false,
  storageKey = "dataTableColumnOrder",
}: DataTableProps<T>) {
  const { t: tc } = useTranslation('common')
  const { isDark, isRTL, textSecondary } = useThemeClasses();
  const initialLoadRef = useRef(true);

  const thRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  // Column Order
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const defaultOrder = columns.map((c) => c.key as string);
    if (typeof window === "undefined") return defaultOrder;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const valid = parsed.filter((k) => columns.some((c) => c.key === k));
        if (valid.length > 0) return valid;
      }
    } catch (error) {
      console.error(error);
    }
    return defaultOrder;
  });

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const [key, el] of Object.entries(thRefs.current)) {
      if (el) map[key] = el.getBoundingClientRect().width;
    }
    setColWidths(map);
  }, [columnOrder]);

  // Horizontal scroll shadow
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledX, setIsScrolledX] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setIsScrolledX(el.scrollLeft > 4);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !initialLoadRef.current) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(columnOrder));
      } catch (error) {
        console.error(error);
      }
    }
  }, [columnOrder, storageKey]);

  const columnKeys = useMemo(
    () => columns.map((c) => c.key as string).join("|"),
    [columns]
  );

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    const visibleKeys = columns.map((c) => c.key as string);
    setColumnOrder((prev) => {
      const kept = prev.filter((k) => visibleKeys.includes(k));
      const added = visibleKeys.filter((k) => !prev.includes(k));
      const next = [...kept, ...added];
      return prev.join("|") === next.join("|") ? prev : next;
    });
  }, [columnKeys, columns]);

  // Sort
  const [sortConfig, setSortConfig] = useState<{
    field: keyof T | null;
    direction: "asc" | "desc" | null;
  }>({ field: null, direction: null });

  const handleSort = useCallback((field: keyof T) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        if (prev.direction === "asc") return { field, direction: "desc" };
        if (prev.direction === "desc") return { field: null, direction: null };
        return { field, direction: "asc" };
      }
      return { field, direction: "asc" };
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction || !data) return data ?? [];
    const field = sortConfig.field;
    return [...data].sort((a, b) =>
      compareValues(a[field], b[field], sortConfig.direction as "asc" | "desc")
    );
  }, [data, sortConfig.field, sortConfig.direction]);

  // Drag & Drop
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((colKey: string) => {
    if (!PINNED_ALL.has(colKey)) setDraggedColumn(colKey);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, colKey: string) => {
      e.preventDefault();
      if (!PINNED_ALL.has(colKey) && draggedColumn && !PINNED_ALL.has(draggedColumn)) {
        setDragOverColumn(colKey);
      }
    },
    [draggedColumn]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetKey: string) => {
      e.preventDefault();
      if (
        draggedColumn &&
        draggedColumn !== targetKey &&
        !PINNED_ALL.has(draggedColumn) &&
        !PINNED_ALL.has(targetKey)
      ) {
        setColumnOrder((prev) => {
          const next = [...prev];
          const from = next.indexOf(draggedColumn);
          const to = next.indexOf(targetKey);
          if (from !== -1 && to !== -1) {
            next.splice(from, 1);
            next.splice(to, 0, draggedColumn);
          }
          return next;
        });
      }
      setDraggedColumn(null);
      setDragOverColumn(null);
    },
    [draggedColumn]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // Selection
  const allSelected = useMemo(
    () => data?.length > 0 && data.every((item) => selectedItems?.has(item[rowKey])),
    [data, selectedItems, rowKey]
  );
  const someSelected = useMemo(
    () => !!(selectedItems && selectedItems.size > 0 && !allSelected),
    [selectedItems, allSelected]
  );

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    const next = new Set(selectedItems);
    if (allSelected) {
      data.forEach((item) => next.delete(item[rowKey]));
    } else {
      data.forEach((item) => next.add(item[rowKey]));
    }
    onSelectionChange(next);
  }, [data, selectedItems, allSelected, rowKey, onSelectionChange]);

  const toggleRow = useCallback(
    (item: T) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedItems);
      const key = item[rowKey];
      next.has(key) ? next.delete(key) : next.add(key);
      onSelectionChange(next);
    },
    [selectedItems, rowKey, onSelectionChange]
  );

  // Sticky styles
  const getStickyStyle = useCallback(
    (colKey: string): React.CSSProperties => {
      if (PINNED_LEFT.has(colKey)) {
        let left = 0;
        for (const key of [...PINNED_LEFT]) {
          if (key === colKey) break;
          left += colWidths[key] ?? 0;
        }
        return { position: "sticky", left, zIndex: 30 };
      }
      if (PINNED_RIGHT.has(colKey)) {
        let right = 0;
        for (const key of [...PINNED_RIGHT].reverse()) {
          if (key === colKey) break;
          right += colWidths[key] ?? 0;
        }
        return { position: "sticky", right, zIndex: 30 };
      }
      return {};
    },
    [colWidths]
  );

  const getStickyBgClass = useCallback(
    (colKey: string, isSelected = false) => {
      if (!PINNED_ALL.has(colKey)) return "";

      const isRight = PINNED_RIGHT.has(colKey);
      const bgBase = isSelected
        ? isDark
          ? "bg-teal-900/20"
          : "bg-teal-50/60"
        : isDark
          ? "bg-gray-900"
          : "bg-white";

      const shadowClass = isScrolledX
        ? isRight
          ? isDark
            ? "shadow-[-1px_0_0_0_rgba(255,255,255,0.07)]"
            : "shadow-[-1px_0_0_0_rgba(0,0,0,0.08)]"
          : isDark
            ? "shadow-[1px_0_0_0_rgba(255,255,255,0.07)]"
            : "shadow-[1px_0_0_0_rgba(0,0,0,0.08)]"
        : "";

      return clsx(bgBase, shadowClass);
    },
    [isDark, isScrolledX]
  );

  const getStickyHeaderBgClass = useCallback(
    (colKey: string) => {
      if (!PINNED_ALL.has(colKey)) return "";
      const isRight = PINNED_RIGHT.has(colKey);
      const bg = isDark ? "bg-gray-900" : "bg-gray-50";
      const shadow = isScrolledX
        ? isRight
          ? isDark
            ? "shadow-[-1px_0_0_0_rgba(255,255,255,0.07)]"
            : "shadow-[-1px_0_0_0_rgba(0,0,0,0.08)]"
          : isDark
            ? "shadow-[1px_0_0_0_rgba(255,255,255,0.07)]"
            : "shadow-[1px_0_0_0_rgba(0,0,0,0.08)]"
        : "";
      return clsx(bg, shadow);
    },
    [isDark, isScrolledX]
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={clsx(
        "rounded-xl border overflow-hidden shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
      )}
    >
      {/* InfiniteScroll Loader - placed after table so it appears at bottom */}
      <InfiniteScroll
        dataLength={data?.length || 0}
        next={next || (() => { })}
        hasMore={hasMore || false}
        scrollableTarget="scrollableDiv"
        loader={null}
      >
        {/* Main Scrollable Container */}
        <div
          id="scrollableDiv"
          ref={scrollRef}
          className="w-full overflow-auto"
          style={{
            maxHeight: "calc(100vh - 220px)", // ← Adjust this as needed
            scrollbarWidth: "none",
          }}
        >

          <table className="w-full border-collapse min-w-full">
            {/* Sticky Header */}
            <thead
              className={clsx(
                "sticky top-0 z-40 border-b",   // ← This makes header sticky
                isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
              )}
            >
              <tr>
                {columnOrder.map((colKey) => {
                  const column = columns.find((c) => c.key === colKey);
                  if (!column) return null;

                  const isPinned = PINNED_ALL.has(colKey);
                  const isSortable = !isPinned && !!column.sortable;
                  const isDraggable = !isPinned;
                  const field = column.key as keyof T;
                  const isDragging = draggedColumn === colKey;
                  const isOver = dragOverColumn === colKey && draggedColumn !== colKey;

                  const stickyStyle: React.CSSProperties = isPinned
                    ? { ...getStickyStyle(colKey), zIndex: 30 }
                    : {};

                  return (
                    <th
                      key={colKey}
                      ref={(el) => { thRefs.current[colKey] = el; }}
                      style={{ width: column.width, ...stickyStyle }}
                      draggable={isDraggable}
                      onDragStart={() => handleDragStart(colKey)}
                      onDragOver={(e) => handleDragOver(e, colKey)}
                      onDrop={(e) => handleDrop(e, colKey)}
                      onDragEnd={handleDragEnd}
                      onClick={() => isSortable && handleSort(field)}
                      className={clsx(
                        "relative px-4 py-3",
                        isRTL ? "text-right" : "text-left",
                        "text-xs font-semibold tracking-widest",
                        "transition-colors duration-150 select-none group",
                        isDark ? "text-gray-400" : "text-gray-500",
                        isSortable && "cursor-pointer",
                        isDraggable && "cursor-grab active:cursor-grabbing",
                        isDragging && "opacity-40",
                        isOver && (isDark ? "bg-teal-900/30" : "bg-teal-50"),
                        isSortable &&
                        (isDark
                          ? "hover:bg-gray-800 hover:text-gray-200"
                          : "hover:bg-gray-100 hover:text-gray-700"),
                        getStickyHeaderBgClass(colKey)
                      )}
                    >
                      {isOver && (
                        <span className="absolute inset-y-0 left-0 w-0.5 bg-teal-500 rounded-full" />
                      )}

                      {colKey === "checkbox" ? (
                        <Checkbox
                          checked={someSelected ? "indeterminate" : allSelected}
                          onCheckedChange={(v) => {
                            if (v !== "indeterminate") toggleAll();
                          }}
                          className={clsx(
                            "cursor-pointer transition-colors",
                            isDark
                              ? "border-gray-600 data-[state=checked]:bg-teal-500 ... "
                              : "border-gray-300 data-[state=checked]:bg-teal-600 ..."
                          )}
                        />
                      ) : (
                        <div className={clsx("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                          {isDraggable && (
                            <GripVertical className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-30 transition-opacity duration-150" />
                          )}
                          <span>{column.label}</span>
                          {isSortable && <SortIcon field={colKey} sortConfig={sortConfig as any} />}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body - scrolls naturally inside the same table */}
            <tbody className={clsx(
              "divide-y",
              isDark ? "divide-gray-800" : "divide-gray-100"
            )}>
              {(hasMore || isDataLoading) && (!sortedData || sortedData.length === 0) ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonRow key={i} cols={columnOrder.length} />
                ))
              ) : ((!sortedData || sortedData.length === 0) && !(hasMore || isDataLoading)) ? (
                <tr>
                  <td colSpan={columnOrder.length} className="h-full">
                    <EmptyState message={t ? t("no_data") : "No data available"} />
                  </td>
                </tr>
              ) : (
                sortedData.map((item, idx) => {
                  const isSelected = Boolean(selectedItems?.has(item[rowKey]));

                  return (
                    <tr
                      key={idx}
                      onClick={() => onRowClick?.(item)}
                      className={clsx(
                        "group relative transition-colors duration-100",
                        onRowClick && "cursor-pointer",
                        isSelected
                          ? isDark
                            ? "bg-teal-900/20"
                            : "bg-teal-50/60"
                          : isDark
                            ? "bg-gray-900 hover:bg-gray-800/60"
                            : "bg-white hover:bg-gray-50"
                      )}
                    >
                      {columnOrder.map((colKey) => {
                        const column = columns.find((c) => c.key === colKey);
                        if (!column) return <td key={colKey} />;

                        const isPinned = PINNED_ALL.has(colKey);

                        return (
                          <td
                            key={colKey}
                            style={getStickyStyle(colKey)}
                            onClick={(e) => colKey === "checkbox" && e.stopPropagation()}
                            className={clsx(
                              "px-4 py-3 text-sm align-middle",
                              isDark ? "text-gray-300" : "text-gray-700",
                              isPinned && getStickyBgClass(colKey, isSelected),
                              isPinned && !isSelected && onRowClick
                                ? isDark
                                  ? "group-hover:bg-gray-800/60"
                                  : "group-hover:bg-gray-50"
                                : undefined
                            )}
                          >
                            {colKey === "checkbox" ? (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleRow(item)}
                                className={clsx(
                                  "cursor-pointer border transition-colors",
                                  isDark
                                    ? "border-gray-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:text-white"
                                    : "border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                                )}
                              />
                            ) : column.render ? (
                              column.render(item)
                            ) : (
                              <span className="truncate max-w-xs block">
                                {String(item[colKey as keyof T] ?? "—")}
                              </span>
                            )}
                          </td>
                        );
                      })}

                    </tr>
                  );

                })
              )}
              <tr>
                <td
                  colSpan={columnOrder.length}
                  className=" pt-2 text-center h-80"
                >
                  {(hasMore || isDataLoading) ? (
                    <div className="flex items-center flex-col justify-center gap-3 pb-40">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                      <div className="text-sm text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                        {tc('loading_text')}
                      </div>
                    </div>
                  ) :
                    <div className={clsx(textSecondary, "pb-40")}>
                      {tc('loading_end_text')}
                    </div>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </InfiniteScroll>
    </div >
  );
}