import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

import { useAppSelector } from '@/hooks/hooks';
import { useThemeClasses } from '@/hooks/useThemeClasses';

/* ================= Types ================= */

type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: keyof T | 'checkbox' | 'actions' | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

/**
 * Allows:
 * condition && { ... }
 * null
 * undefined
 */
type MaybeColumn<T> = Column<T> | false | null | undefined;

interface DataTableProps<T> {
  data: T[];
  columns: MaybeColumn<T>[];
  rowKey: keyof T;

  storageKey?: string;
  onRowClick?: (item: T) => void;

  selectedItems?: Set<T[keyof T]>;
  onSelectionChange?: (selected: Set<T[keyof T]>) => void;
}

/* ================= Helpers ================= */

function isColumn<T>(col: MaybeColumn<T>): col is Column<T> {
  return Boolean(col);
}

/* ================= Component ================= */

export default function ReordableDataTable<T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  storageKey = 'dataTableColumnOrder',
  onRowClick,
  selectedItems,
  onSelectionChange,
}: DataTableProps<T>) {
  const { theme, isRTL } = useAppSelector(state => state.settings);
  const { bgTertiary, borderColor, textSecondary, hoverBg } = useThemeClasses();

  /** Filter out falsy columns safely */
  const validColumns = useMemo(() => columns.filter(isColumn), [columns]);

  /* ---------- Column order ---------- */

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return validColumns.map(c => c.key as string);
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const validKeys = validColumns.map(c => c.key as string);

        const filtered = parsed.filter(k => validKeys.includes(k));
        return filtered.length ? filtered : validKeys;
      }
    } catch {
      /* ignore */
    }

    return validColumns.map(c => c.key as string);
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columnOrder));
  }, [columnOrder, storageKey]);

  /* ---------- Sorting ---------- */

  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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
      const next =
        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';

      setSortDirection(next);
      if (!next) setSortField(null);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /* ---------- Drag & Drop ---------- */

  const [dragged, setDragged] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDrop = (target: string) => {
    if (!dragged || dragged === target) return;

    const next = [...columnOrder];
    const from = next.indexOf(dragged);
    const to = next.indexOf(target);

    next.splice(from, 1);
    next.splice(to, 0, dragged);
    setColumnOrder(next);

    setDragged(null);
    setDragOver(null);
  };

  /* ---------- Selection ---------- */

  const allSelected =
    selectedItems &&
    data.length > 0 &&
    data.every(item => selectedItems.has(item[rowKey]));

  const someSelected =
    selectedItems && selectedItems.size > 0 && !allSelected;

  const toggleAll = () => {
    if (!onSelectionChange) return;

    const next = new Set(selectedItems);
    if (allSelected) {
      data.forEach(i => next.delete(i[rowKey]));
    } else {
      data.forEach(i => next.add(i[rowKey]));
    }
    onSelectionChange(next);
  };

  const toggleRow = (item: T) => {
    if (!onSelectionChange) return;

    const next = new Set(selectedItems);
    const key = item[rowKey];

    next.has(key) ? next.delete(key) : next.add(key);
    onSelectionChange(next);
  };

  const sortIcon = (field: keyof T) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  /* ================= Render ================= */

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
      <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
        <table className="w-full">
          <thead className={`sticky top-0 z-50 ${bgTertiary} border-b ${borderColor}`}>
            <tr>
              {columnOrder.map(key => {
                const column = validColumns.find(c => c.key === key);
                if (!column) return null;

                const sortable = column.sortable && typeof column.key === 'string';
                const field = column.key as keyof T;

                return (
                  <th
                    key={key}
                    draggable={!['checkbox', 'actions'].includes(key)}
                    onDragStart={() => setDragged(key)}
                    onDragOver={e => {
                      e.preventDefault();
                      setDragOver(key);
                    }}
                    onDrop={() => handleDrop(key)}
                    onDragEnd={() => setDragged(null)}
                    onClick={() => sortable && handleSort(field)}
                    className={`p-3 text-${isRTL ? 'right' : 'left'} text-sm ${textSecondary}
                      ${sortable ? 'cursor-pointer' : ''}`}
                    style={{
                      width: column.width,
                      background:
                        dragOver === key
                          ? theme === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.05)'
                          : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {!['checkbox', 'actions'].includes(key) && (
                        <GripVertical className="w-4 h-4 opacity-50" />
                      )}

                      {key === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={!!allSelected}
                          // ref={el => el && (el.indeterminate = !!someSelected)}
                          onChange={toggleAll}
                        />
                      ) : (
                        <>
                          {column.label}
                          {sortable && sortIcon(field)}
                        </>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columnOrder.length} className="py-10 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map(item => (
                <tr
                  key={String(item[rowKey])}
                  onClick={() => onRowClick?.(item)}
                  className={`${hoverBg} ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columnOrder.map(key => {
                    const column = validColumns.find(c => c.key === key);
                    if (!column) return null;

                    return (
                      <td key={key} className="p-3 text-sm">
                        {key === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={!!selectedItems?.has(item[rowKey])}
                            onChange={() => toggleRow(item)}
                          />
                        ) : column.render ? (
                          column.render(item)
                        ) : (
                          String(item[key as keyof T] ?? '-')
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
