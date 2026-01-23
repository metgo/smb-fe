import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical, Loader } from 'lucide-react';
import { useAppSelector } from '@/hooks/hooks';

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  key: keyof T | 'checkbox' | 'actions' | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  isLoading?: boolean;
  data: T[];
  columns: Column<T>[];
  storageKey?: string;
  onRowClick?: (item: T) => void;
  selectedItems?: Set<any>;
  onSelectionChange?: (selected: Set<any>) => void;
  rowKey: keyof T;
}

export default function ReordableDataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  storageKey = 'dataTableColumnOrder',
  onRowClick,
  selectedItems,
  onSelectionChange,
  rowKey,
}: DataTableProps<T>) {
  const { isRTL, theme } = useAppSelector(state => state.settings)

  // Load saved column order and validate it matches current columns
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const validColumnKeys = columns.map(c => c.key as string);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter to only include valid column keys that exist in current columns
        const validOrder = parsed.filter((k: string) => validColumnKeys.includes(k));

        // If we have valid saved order with all columns, use it
        if (validOrder.length === validColumnKeys.length) {
          return validOrder;
        }
      }
    } catch (e) {
      console.error('Failed to load column order:', e);
    }
    return validColumnKeys;
  });

  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Validate and sync column order when columns prop changes
  useEffect(() => {
    const validColumnKeys = columns.map(c => c.key as string);
    const currentOrderIsValid = columnOrder.every(k => validColumnKeys.includes(k))
      && columnOrder.length === validColumnKeys.length;

    if (!currentOrderIsValid) {
      setColumnOrder(validColumnKeys);
    }
  }, [columns]);

  // Save column order
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(columnOrder));
    } catch (e) {
      console.error('Failed to save column order:', e);
    }
  }, [columnOrder, storageKey]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      const next = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
      setSortDirection(next);
      if (next === null) setSortField(null);
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  const allSelected = data?.length > 0 && data.every(item => selectedItems && selectedItems?.has(item[rowKey]));
  const someSelected = selectedItems && selectedItems.size > 0 && !allSelected;

  const toggleAll = () => {
    const newSelected = new Set(selectedItems);
    if (allSelected) {
      data.forEach(item => newSelected.delete(item[rowKey]));
    } else {
      data.forEach(item => newSelected.add(item[rowKey]));
    }
    if (onSelectionChange)
      onSelectionChange(newSelected);
  };

  const toggleRow = (item: T) => {
    const newSelected = new Set(selectedItems);
    const key = item[rowKey];
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    if (onSelectionChange)
      onSelectionChange(newSelected);
  };

  const getSortIcon = (field: keyof T) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  // Get valid columns only - those that exist in both columnOrder and columns definition
  const validColumns = columnOrder
    .map(colKey => columns.find(c => c.key === colKey))
    .filter((col): col is Column<T> => col !== undefined);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Scrollable container */}
      <div className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto">
        <table className="w-full h-full relative">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              {validColumns.map(column => {
                const colKey = column.key as string;
                const isSortable = column.sortable && typeof column.key === 'string';
                const field = column.key as keyof T;

                return (
                  <th
                    key={colKey}
                    className={`p-3 text-${isRTL ? 'right' : 'left'} text-sm text-gray-600 dark:text-gray-400 tracking-wider select-none
                      ${isSortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : ''}
                      transition-colors group`}
                    style={{
                      width: column.width,
                      backgroundColor:
                        dragOverColumn === colKey
                          ? theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.05)'
                          : undefined,
                    }}
                    draggable={colKey !== 'checkbox' && colKey !== 'actions'}
                    onDragStart={() => handleDragStart(colKey)}
                    onDragOver={e => handleDragOver(e, colKey)}
                    onDrop={e => handleDrop(e, colKey)}
                    onDragEnd={handleDragEnd}
                    onClick={() => isSortable && handleSort(field)}
                  >
                    <div className="flex items-center gap-2">
                      {colKey !== 'checkbox' && colKey !== 'actions' && (
                        <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                      )}

                      {colKey === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input: HTMLInputElement | null) => {
                            if (input && someSelected) input.indeterminate = someSelected;
                          }}
                          onChange={toggleAll}
                          className="rounded border-gray-300 dark:border-gray-600"
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

          {/* Scrollable Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={validColumns.length} className="py-20 text-center">
                  <Loader className="w-8 h-8 animate-spin text-teal-500 mx-auto" />
                </td>
              </tr>
            ) : sortedData?.length === 0 ? (
              <tr>
                <td colSpan={validColumns.length} className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => (
                <tr
                  key={item[rowKey] ?? idx}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {validColumns.map(column => {
                    const colKey = column.key as string;
                    return (
                      <td
                        key={colKey}
                        className="p-3 text-sm"
                        onClick={e => colKey === 'checkbox' && e.stopPropagation()}
                      >
                        {colKey === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={selectedItems && selectedItems.has(item[rowKey])}
                            onChange={() => toggleRow(item)}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                        ) : column.render ? (
                          column.render(item)
                        ) : (
                          String(item[colKey as keyof T] ?? '-')
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