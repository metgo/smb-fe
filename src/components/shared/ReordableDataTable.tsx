import clsx from "clsx";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import { ArrowUpDown, ArrowUp, ArrowDown, Loader } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Checkbox } from "@/components/ui/checkbox";

type SortDirection = "asc" | "desc" | null;

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
  const { isRTL } = useAppSelector((state) => state.settings);
  const {
    bgTertiary,
    borderColor,
    textSecondary,
    textPrimary,
    hoverBg,
    isDark,
  } = useThemeClasses();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initialLoadRef = useRef(true);

  // Load saved column order - only once on mount
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const defaultOrder = columns.map((c) => c.key as string);

    if (typeof window === "undefined") {
      return defaultOrder;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        // Filter out any saved columns that don't exist anymore
        const validKeys = parsed.filter((k) =>
          columns.some((c) => c.key === k),
        );

        // If we have valid saved keys, use them
        if (validKeys.length > 0) {
          return validKeys;
        }
      }
    } catch (e) {
      console.error("Failed to load column order:", e);
    }

    return defaultOrder;
  });

  const [sortConfig, setSortConfig] = useState<{
    field: keyof T | null;
    direction: SortDirection;
  }>({ field: null, direction: null });

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Save column order when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && !initialLoadRef.current) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(columnOrder));
      } catch (e) {
        console.error("Failed to save column order:", e);
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

    const visibleKeys = columns.map((c) => c.key as string);

    setColumnOrder((prev) => {
      const existingVisible = prev.filter((key) => visibleKeys.includes(key));

      const newColumns = visibleKeys.filter((key) => !prev.includes(key));

      const next = [...existingVisible, ...newColumns];

      return prev.join("|") === next.join("|") ? prev : next;
    });
  }, [columnKeys]);

  // Helper function to safely compare values for sorting
  const compareValues = (a: any, b: any, direction: "asc" | "desc"): number => {
    // Handle null/undefined
    if (a == null && b == null) return 0;
    if (a == null) return direction === "asc" ? 1 : -1;
    if (b == null) return direction === "asc" ? -1 : 1;

    // Handle dates - check if they can be converted to Date objects
    const aDate =
      typeof a === "string" || typeof a === "number" ? new Date(a) : null;
    const bDate =
      typeof b === "string" || typeof b === "number" ? new Date(b) : null;

    // Check if both are valid dates
    if (aDate && bDate && !isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return direction === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Handle strings
    if (typeof a === "string" && typeof b === "string") {
      return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
    }

    // Handle numbers
    if (typeof a === "number" && typeof b === "number") {
      return direction === "asc" ? a - b : b - a;
    }

    // Handle booleans
    if (typeof a === "boolean" && typeof b === "boolean") {
      return direction === "asc"
        ? a === b
          ? 0
          : a
            ? 1
            : -1
        : a === b
          ? 0
          : a
            ? -1
            : 1;
    }

    // Default comparison
    if (a < b) return direction === "asc" ? -1 : 1;
    if (a > b) return direction === "asc" ? 1 : -1;
    return 0;
  };

  // Sorted data - FIXED sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction || !data) {
      return data || [];
    }

    const field = sortConfig.field;

    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      return compareValues(aVal, bVal, sortConfig.direction as "asc" | "desc");
    });
  }, [data, sortConfig.field, sortConfig.direction]);

  const handleSort = useCallback((field: keyof T) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        // Cycle through: asc -> desc -> null
        if (prev.direction === "asc") {
          return { field, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { field: null, direction: null };
        } else {
          return { field, direction: "asc" };
        }
      } else {
        // New field, start with asc
        return { field, direction: "asc" };
      }
    });
  }, []);

  const handleDragStart = useCallback(
    (colKey: string) => setDraggedColumn(colKey),
    [],
  );
  const handleDragOver = useCallback((e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDragOverColumn(colKey);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetKey: string) => {
      e.preventDefault();
      if (draggedColumn && draggedColumn !== targetKey) {
        setColumnOrder((prev) => {
          const newOrder = [...prev];
          const draggedIndex = newOrder.indexOf(draggedColumn);
          const targetIndex = newOrder.indexOf(targetKey);

          if (draggedIndex !== -1 && targetIndex !== -1) {
            newOrder.splice(draggedIndex, 1);
            newOrder.splice(targetIndex, 0, draggedColumn);
          }
          return newOrder;
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

  // Selection handlers
  const allSelected = useMemo(() => {
    return (
      data?.length > 0 && data.every((item) => selectedItems?.has(item[rowKey]))
    );
  }, [data, selectedItems, rowKey]);

  const someSelected = useMemo(() => {
    return selectedItems && selectedItems.size > 0 && !allSelected;
  }, [selectedItems, allSelected]);

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;

    const newSelected = new Set(selectedItems);
    if (allSelected) {
      data.forEach((item) => newSelected.delete(item[rowKey]));
    } else {
      data.forEach((item) => newSelected.add(item[rowKey]));
    }
    onSelectionChange(newSelected);
  }, [data, selectedItems, allSelected, rowKey, onSelectionChange]);

  const toggleRow = useCallback(
    (item: T) => {
      if (!onSelectionChange) return;

      const newSelected = new Set(selectedItems);
      const key = item[rowKey];
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      onSelectionChange(newSelected);
    },
    [selectedItems, rowKey, onSelectionChange],
  );

  const getSortIcon = useCallback(
    (field: keyof T) => {
      if (sortConfig.field !== field) {
        return <ArrowUpDown className="w-4 h-4 opacity-40" />;
      }
      return sortConfig.direction === "asc" ? (
        <ArrowUp className="w-4 h-4" />
      ) : (
        <ArrowDown className="w-4 h-4" />
      );
    },
    [sortConfig.field, sortConfig.direction],
  );

  // Infinite scroll hook
  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isDataLoading,
    onLoadMore: next,
  });

  return (
    <div className={`rounded-xl border ${borderColor}`}>
      {/* Scrollable container */}
      <div
        className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto"
        id="business-table-scroll"
        ref={scrollRef}
      >
        <table className="w-full h-full">
          <thead
            className={`sticky top-0 z-5 ${bgTertiary} border-b ${borderColor}`}
          >
            <tr>
              {columnOrder?.map((colKey) => {
                const column = columns.find((c) => c.key === colKey);
                if (!column) return null;

                const isSortable =
                  column.sortable && typeof column.key === "string";
                const field = column.key as keyof T;

                return (
                  <th
                    key={colKey}
                    className={`p-3 text-${isRTL ? "right" : "left"} text-sm ${textSecondary} tracking-wider select-none
                      ${isSortable ? `cursor-pointer ${bgTertiary} ` : ""}
                      transition-colors group`}
                    style={{
                      width: column.width,
                      backgroundColor:
                        dragOverColumn === colKey
                          ? isDark
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.05)"
                          : undefined,
                    }}
                    draggable={colKey !== "checkbox" && colKey !== "actions"}
                    onDragStart={() => handleDragStart(colKey as string)}
                    onDragOver={(e) => handleDragOver(e, colKey as string)}
                    onDrop={(e) => handleDrop(e, colKey as string)}
                    onDragEnd={handleDragEnd}
                    onClick={() => isSortable && handleSort(field)}
                  >
                    <div className="flex items-center gap-2">
                      {colKey === "checkbox" ? (
                        <Checkbox
                          checked={someSelected ? "indeterminate" : allSelected}
                          onCheckedChange={(checked) => {
                            if (checked !== "indeterminate") {
                              toggleAll();
                            }
                          }}
                          className={clsx(
                            "cursor-pointer transition-colors",
                            isDark
                              ? [
                                  "border-gray-600",
                                  "data-[state=checked]:bg-teal-500",
                                  "data-[state=checked]:border-teal-500",
                                  "data-[state=indeterminate]:bg-teal-500",
                                  "data-[state=indeterminate]:border-teal-500",
                                  "text-white",
                                ]
                              : [
                                  "border-gray-300",
                                  "data-[state=checked]:bg-teal-600",
                                  "data-[state=checked]:border-teal-600",
                                  "data-[state=indeterminate]:bg-teal-600",
                                  "data-[state=indeterminate]:border-teal-600",
                                ],
                          )}
                        />
                      ) : (
                        <>
                          <span>{column.label}</span>
                          {isSortable && getSortIcon(field)}
                        </>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {(!sortedData || sortedData.length === 0) && !isDataLoading ? (
              <tr>
                <td
                  colSpan={columnOrder?.length || 1}
                  className={clsx("h-32 text-center ", textPrimary)}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    {t ? t("no_data") : "No data available"}
                  </div>
                </td>
              </tr>
            ) : (
              // Normal data rows
              sortedData?.map((item, idx) => (
                <tr
                  key={item[rowKey] ?? idx}
                  onClick={() => onRowClick?.(item)}
                  className={`${isDark ? "bg-gray-900 text-gray-400" : "bg-white"} ${hoverBg} ${onRowClick ? "cursor-pointer hover:bg-gray-50 " : ""} `}
                >
                  {columnOrder?.map((colKey) => {
                    const column = columns.find((c) => c.key === colKey);
                    if (!column) return <td key={colKey} />;

                    return (
                      <td
                        key={colKey}
                        className={clsx(
                          "p-3 z-10 text-sm cursor-pointer",
                          textSecondary,
                        )}
                        onClick={(e) =>
                          colKey === "checkbox" && e.stopPropagation()
                        }
                      >
                        {colKey === "checkbox" ? (
                          <Checkbox
                            checked={selectedItems?.has(item[rowKey]) ?? false}
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
                          String(item[colKey as keyof T] ?? "-")
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
            {isDataLoading && (
              <tr className="h-80" aria-rowspan={80}>
                <td
                  colSpan={columnOrder?.length || 1}
                  className="h-80 text-center"
                >
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
