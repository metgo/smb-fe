import clsx from "clsx";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, GripVertical, Loader2 } from "lucide-react";

import { compareValues } from "@/helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import SortIcon from "./SortIcon";
import EmptyState from "./EmptyState";
import SkeletonRow from "./SkeletonRow";

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
  maxHeight?: string;
  // Returns the label for the group a row belongs to (e.g. a formatted day).
  // Consecutive rows sharing a label are rendered under one sticky separator.
  groupBy?: (item: T) => string;
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
  maxHeight,
  groupBy,
}: DataTableProps<T>) {
  const { t: tc } = useTranslation("common");
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolledX, setIsScrolledX] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // RTL layouts produce negative scrollLeft in Chrome/Edge, so use Math.abs.
    const handler = () => setIsScrolledX(Math.abs(el.scrollLeft) > 4);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container || !hasMore || isDataLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) next?.();
      },
      { root: container, threshold: 0, rootMargin: "50px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isDataLoading, next]);

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
    [columns],
  );

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    const visibleKeys = columnKeys.split("|");
    setColumnOrder((prev) => {
      const kept = prev.filter((k) => visibleKeys.includes(k));
      const added = visibleKeys.filter((k) => !prev.includes(k));
      const next = [...kept, ...added];
      return prev.join("|") === next.join("|") ? prev : next;
    });
  }, [columnKeys]);

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
      compareValues(a[field], b[field], sortConfig.direction as "asc" | "desc"),
    );
  }, [data, sortConfig.field, sortConfig.direction]);

  // Entry computed per row only when it starts a new group (consecutive rows
  // sharing a label collapse under one separator), so manual sorting stays
  // intact — grouping just reflects whatever order sortedData ends up in.
  // groupStart keys collapse state, since labels can repeat across
  // non-contiguous runs and we only want to collapse the clicked run.
  const groupEntries = useMemo(() => {
    if (!groupBy) return null;
    const labels = sortedData.map((item) => groupBy(item));
    const counts = new Map<string, number>();
    for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);

    const entries: ({
      label: string;
      count: number;
      groupStart: number;
    } | null)[] = [];
    let lastLabel: string | null = null;
    labels.forEach((label, index) => {
      entries.push(
        label !== lastLabel
          ? { label, count: counts.get(label) ?? 0, groupStart: index }
          : null,
      );
      lastLabel = label;
    });
    return entries;
  }, [groupBy, sortedData]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(
    () => new Set(),
  );

  const toggleGroupCollapse = useCallback((groupStart: number) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupStart) ? next.delete(groupStart) : next.add(groupStart);
      return next;
    });
  }, []);

  // Index of the group each row belongs to (its group's start index), so we
  // know whether a row should be hidden because its group is collapsed.
  const rowGroupStart = useMemo(() => {
    if (!groupEntries) return null;
    const starts: number[] = [];
    let current = 0;
    groupEntries.forEach((entry, index) => {
      if (entry) current = index;
      starts.push(current);
    });
    return starts;
  }, [groupEntries]);

  // Drag & Drop
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((colKey: string) => {
    if (!PINNED_ALL.has(colKey)) setDraggedColumn(colKey);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, colKey: string) => {
      e.preventDefault();
      if (
        !PINNED_ALL.has(colKey) &&
        draggedColumn &&
        !PINNED_ALL.has(draggedColumn)
      ) {
        setDragOverColumn(colKey);
      }
    },
    [draggedColumn],
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
    [draggedColumn],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // Selection
  const allSelected = useMemo(
    () =>
      data?.length > 0 &&
      data.every((item) => selectedItems?.has(item[rowKey])),
    [data, selectedItems, rowKey],
  );
  const someSelected = useMemo(
    () => !!(selectedItems && selectedItems.size > 0 && !allSelected),
    [selectedItems, allSelected],
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
    [selectedItems, rowKey, onSelectionChange],
  );

  // ─── Sticky position (inline style for left/right offset) ─────────────────
  // In RTL the visual sides are flipped: PINNED_LEFT (checkbox) sticks to the
  // right edge, and PINNED_RIGHT (actions) sticks to the left edge.
  const getStickyStyle = useCallback(
    (colKey: string): React.CSSProperties => {
      if (PINNED_LEFT.has(colKey)) {
        let offset = 0;
        for (const key of [...PINNED_LEFT]) {
          if (key === colKey) break;
          offset += colWidths[key] ?? 0;
        }
        return isRTL
          ? { position: "sticky", right: offset, zIndex: 20 }
          : { position: "sticky", left: offset, zIndex: 20 };
      }
      if (PINNED_RIGHT.has(colKey)) {
        let offset = 0;
        for (const key of [...PINNED_RIGHT].reverse()) {
          if (key === colKey) break;
          offset += colWidths[key] ?? 0;
        }
        return isRTL
          ? { position: "sticky", left: offset, zIndex: 20 }
          : { position: "sticky", right: offset, zIndex: 20 };
      }
      return {};
    },
    [colWidths, isRTL],
  );

  // ─── Sticky background + shadow (className) ───────────────────────────────
  //
  // Shadow and border must face the scrolling content, which in RTL is the
  // opposite physical side from LTR.  We derive "visually on the right edge"
  // rather than "in the PINNED_RIGHT set" so the logic stays direction-aware.
  //
  const getStickyBgClass = useCallback(
    (colKey: string, isSelected = false) => {
      if (!PINNED_ALL.has(colKey)) return "";

      // True when the column sits on the visual right edge of the table.
      const isVisuallyRight = isRTL
        ? PINNED_LEFT.has(colKey)
        : PINNED_RIGHT.has(colKey);

      // Base background — must be opaque
      const bg = isSelected
        ? isDark
          ? "bg-teal-900/40"
          : "bg-teal-50"
        : isDark
          ? "bg-gray-900"
          : "bg-white";

      // Dividing shadow line visible only while scrolled
      const shadow = isScrolledX
        ? isVisuallyRight
          ? isDark
            ? "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.5)]"
            : "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.10)]"
          : isDark
            ? "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]"
            : "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.10)]"
        : "";

      // Border line on the inner edge of the pinned column
      const border = isVisuallyRight
        ? isDark
          ? "border-l border-gray-700/60"
          : "border-l border-gray-200"
        : isDark
          ? "border-r border-gray-700/60"
          : "border-r border-gray-200";

      return clsx(bg, shadow, border);
    },
    [isDark, isScrolledX, isRTL],
  );

  // Header variant — always uses the header background
  const getStickyHeaderBgClass = useCallback(
    (colKey: string) => {
      if (!PINNED_ALL.has(colKey)) return isDark ? "bg-gray-900" : "bg-gray-50";

      const isVisuallyRight = isRTL
        ? PINNED_LEFT.has(colKey)
        : PINNED_RIGHT.has(colKey);

      const bg = isDark ? "bg-gray-900" : "bg-gray-50";

      const shadow = isScrolledX
        ? isVisuallyRight
          ? isDark
            ? "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.5)]"
            : "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.10)]"
          : isDark
            ? "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]"
            : "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.10)]"
        : "";

      const border = isVisuallyRight
        ? isDark
          ? "border-l border-gray-700/60"
          : "border-l border-gray-200"
        : isDark
          ? "border-r border-gray-700/60"
          : "border-r border-gray-200";

      return clsx(bg, shadow, border);
    },
    [isDark, isScrolledX, isRTL],
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={clsx(
        "rounded-xl border overflow-hidden shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white",
      )}
    >
      {/* Main Scrollable Container */}
      <div
        ref={scrollRef}
        className="w-full overflow-auto"
        style={{
          maxHeight: maxHeight ?? "calc(100vh - 180px)",
          scrollbarWidth: "none",
        }}
      >
        <table className="w-full border-collapse min-w-full">
          {/* ── Sticky Header ── */}
          <thead
            className={clsx(
              "sticky top-0 z-30 border-b",
              isDark
                ? "bg-gray-900 border-gray-800"
                : "bg-gray-50 border-gray-200",
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
                const isOver =
                  dragOverColumn === colKey && draggedColumn !== colKey;

                // Pinned header cells need horizontal sticky + z-index above body pinned cells
                const stickyStyle: React.CSSProperties = isPinned
                  ? { ...getStickyStyle(colKey), zIndex: 40 }
                  : {};

                return (
                  <th
                    key={colKey}
                    ref={(el) => {
                      thRefs.current[colKey] = el;
                    }}
                    style={{ width: column.width, ...stickyStyle }}
                    draggable={isDraggable}
                    onDragStart={() => handleDragStart(colKey)}
                    onDragOver={(e) => handleDragOver(e, colKey)}
                    onDrop={(e) => handleDrop(e, colKey)}
                    onDragEnd={handleDragEnd}
                    onClick={() => isSortable && handleSort(field)}
                    className={clsx(
                      "relative px-4 py-4 min-h-13 align-middle",
                      isRTL ? "text-right" : "text-left",
                      "text-xs font-semibold tracking-wider leading-normal",
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
                      getStickyHeaderBgClass(colKey),
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
                            ? "border-gray-600 data-[state=checked]:bg-teal-500"
                            : "border-gray-300 data-[state=checked]:bg-teal-600",
                        )}
                      />
                    ) : (
                      <div
                        className={clsx(
                          "flex items-center gap-1.5",
                          isRTL && "flex-row-reverse",
                        )}
                      >
                        {isDraggable && (
                          <GripVertical className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-30 transition-opacity duration-150" />
                        )}
                        <span>{column.label}</span>
                        {isSortable && (
                          <SortIcon
                            field={colKey}
                            sortConfig={sortConfig as any}
                          />
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody
            className={clsx(
              "divide-y",
              isDark ? "divide-gray-800" : "divide-gray-100",
            )}
          >
            {isDataLoading && (!sortedData || sortedData.length === 0) ? (
              Array.from({ length: 12 }).map((_, i) => (
                <SkeletonRow key={i} cols={columnOrder.length} />
              ))
            ) : (!sortedData || sortedData.length === 0) &&
              !(hasMore || isDataLoading) ? (
              <tr>
                <td colSpan={columnOrder.length} className="h-full">
                  <EmptyState
                    message={t ? t("no_data") : "No data available"}
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => {
                const isSelected = Boolean(selectedItems?.has(item[rowKey]));
                const groupEntry = groupEntries?.[index];
                const groupStart = rowGroupStart?.[index];
                const isGroupCollapsed =
                  groupStart != null && collapsedGroups.has(groupStart);

                if (groupEntry == null && isGroupCollapsed) return null;

                return (
                  <React.Fragment key={index}>
                    {groupEntry != null && (
                      <tr
                        onClick={() =>
                          toggleGroupCollapse(groupEntry.groupStart)
                        }
                        className="cursor-pointer select-none"
                      >
                        <td
                          colSpan={columnOrder.length}
                          className={clsx(
                            "sticky top-13 z-20 px-4 py-2 tracking-wide flex text-sm font-bold items-center gap-2",
                            isDark
                              ? "bg-gray-800/80 border-b border-gray-800 hover:bg-gray-800"
                              : "bg-gray-100/80 border-b border-gray-200 hover:bg-gray-100",
                            textSecondary,
                          )}
                        >
                          <ChevronDown
                            className={clsx(
                              "w-4 h-4 transition-transform duration-150",
                              collapsedGroups.has(groupEntry.groupStart) &&
                                (isRTL ? "rotate-90" : "-rotate-90"),
                            )}
                          />
                          <span>{groupEntry.label}</span>
                          <span className="font-normal opacity-70">
                            ({groupEntry.count})
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr
                      // FIX: only fire row navigation when clicking a non-pinned cell.
                      // We guard this at the <td> level below instead of stopping
                      // propagation there, so the tr handler is intentionally simple.
                      onClick={() => onRowClick?.(item)}
                      className={clsx(
                        "group relative transition-colors duration-100",
                        isGroupCollapsed && "hidden",
                        onRowClick && "cursor-pointer",
                        isSelected
                          ? isDark
                            ? "bg-teal-900/20"
                            : "bg-teal-50/60"
                          : isDark
                            ? "bg-gray-900 hover:bg-gray-800/60"
                            : "bg-white hover:bg-gray-50",
                      )}
                    >
                      {columnOrder.map((colKey) => {
                        const column = columns.find((c) => c.key === colKey);
                        if (!column) return <td key={colKey} />;

                        const isPinned = PINNED_ALL.has(colKey);
                        const isPinnedRight = PINNED_RIGHT.has(colKey);

                        return (
                          <td
                            key={colKey}
                            style={getStickyStyle(colKey)}
                            // FIX: stop propagation on the <td> for checkbox AND
                            // actions columns so neither triggers row navigation.
                            // Buttons inside actions already call e.stopPropagation()
                            // on their own onClick, but this catches clicks on the
                            // cell padding around them.
                            onClick={
                              colKey === "checkbox" || isPinnedRight
                                ? (e) => e.stopPropagation()
                                : undefined
                            }
                            className={clsx(
                              "px-4 py-3 text-sm align-middle",
                              isDark ? "text-gray-300" : "text-gray-700",
                              // FIX: pinned cells get a solid, state-aware background
                              isPinned && getStickyBgClass(colKey, isSelected),
                              // FIX: mirror the row hover on pinned cells so they
                              // don't look disconnected while the cursor moves across
                              isPinned && !isSelected && onRowClick
                                ? isDark
                                  ? "group-hover:bg-gray-800/60"
                                  : "group-hover:bg-gray-50"
                                : undefined,
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
                                    : "border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600",
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
                  </React.Fragment>
                );
              })
            )}
            <tr>
              <td colSpan={columnOrder.length} className="pt-2 text-center">
                <div ref={sentinelRef} />
                {isDataLoading ? (
                  <div className="flex items-center flex-col justify-center gap-3 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    <div className="text-sm text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                      {tc("loading_text")}
                    </div>
                  </div>
                ) : !hasMore ? (
                  <div className={clsx(textSecondary, "py-8")}>
                    {tc("loading_end_text")}
                  </div>
                ) : (
                  <div className="py-6" />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
