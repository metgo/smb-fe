import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  // GripVertical,
  Loader,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

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
  t: (key: string) => string;
}

export default function ReordableDataTable<T extends Record<string, any>>({
  data,
  columns,
  storageKey = "dataTableColumnOrder",
  onRowClick,
  selectedItems,
  onSelectionChange,
  rowKey,
  hasMore,
  next,
  t,
  isDataLoading = false,
}: DataTableProps<T>) {
  console.log("🚀 ~ ReordableDataTable ~ columns:", columns);

  const { theme, isRTL } = useAppSelector((state) => state.settings);
  const { bgTertiary, borderColor, textSecondary, hoverBg } = useThemeClasses();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load saved column order
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return columns.map((c) => c.key as string);
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);

        const validKeys = parsed.filter((k) =>
          columns.some((c) => c.key === k),
        );

        const missingKeys = columns
          .map((c) => c.key as string)
          .filter((k) => !validKeys.includes(k));

        return [...validKeys, ...missingKeys];
      }
    } catch (e) {
      console.error("Failed to load column order:", e);
    }

    return columns.map((c) => c.key as string);
  });

  console.log("🚀 ~ ReordableDataTable ~ columnOrder:", columnOrder);
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Save column order
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(columnOrder));
    } catch (e) {
      console.error("Failed to save column order:", e);
    }
  }, [columnOrder, storageKey]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      const next =
        sortDirection === "asc"
          ? "desc"
          : sortDirection === "desc"
            ? null
            : "asc";
      setSortDirection(next);
      if (next === null) setSortField(null);
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDragStart = (colKey: string) => setDraggedColumn(colKey);
  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== colKey) {
      setDragOverColumn(colKey);
    }
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetKey) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetKey);
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      setColumnOrder(newOrder);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const allSelected =
    data?.length > 0 &&
    data.every((item) => selectedItems && selectedItems?.has(item[rowKey]));
  const someSelected = selectedItems && selectedItems.size > 0 && !allSelected;

  const toggleAll = () => {
    const newSelected = new Set(selectedItems);
    if (allSelected) {
      data.forEach((item) => newSelected.delete(item[rowKey]));
    } else {
      data.forEach((item) => newSelected.add(item[rowKey]));
    }
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  const toggleRow = (item: T) => {
    const newSelected = new Set(selectedItems);
    const key = item[rowKey];
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  const getSortIcon = (field: keyof T) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  //hook for scroll
  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isDataLoading,
    onLoadMore: next,
  });

  console.log("🚀 ~ ReordableDataTable ~ sortedData:", sortedData);
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
                      ${isSortable ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" : ""}
                      transition-colors group`}
                    style={{
                      width: column.width,
                      backgroundColor:
                        dragOverColumn === colKey
                          ? theme === "dark"
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
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input: HTMLInputElement | null) => {
                            if (input && someSelected)
                              input.indeterminate = someSelected;
                          }}
                          onChange={toggleAll}
                          className="rounded border-gray-300  "
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
            {isDataLoading ? (
              <tr>
                <td
                  colSpan={columnOrder?.length || 1}
                  className="h-80 text-center"
                >
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  </div>
                </td>
              </tr>
            ) : sortedData?.length === 0 ? (
              // No data state
              <tr>
                <td
                  colSpan={columnOrder?.length || 1}
                  className="h-32 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    {t("no_data")}
                  </div>
                </td>
              </tr>
            ) : (
              // Normal data rows
              sortedData?.map((item, idx) => (
                <tr
                  key={item[rowKey] ?? idx}
                  onClick={() => onRowClick?.(item)}
                  className={`${theme === "dark" ? "bg-gray-900 text-gray-400" : "bg-white"} ${hoverBg} ${onRowClick ? "cursor-pointer hover:bg-gray-50 " : ""} `}
                >
                  {columnOrder?.map((colKey) => {
                    const column = columns.find((c) => c.key === colKey);
                    if (!column) return <td key={colKey} />;

                    return (
                      <td
                        key={colKey}
                        className="p-3 text-sm"
                        onClick={(e) =>
                          colKey === "checkbox" && e.stopPropagation()
                        }
                      >
                        {colKey === "checkbox" ? (
                          <input
                            type="checkbox"
                            checked={selectedItems?.has(item[rowKey]) ?? false}
                            onChange={() => toggleRow(item)}
                            className="rounded border-gray-300 dark:border-gray-600 focus:ring-teal-500"
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
