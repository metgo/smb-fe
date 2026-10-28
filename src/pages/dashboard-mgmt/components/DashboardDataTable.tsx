import clsx from "clsx";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DashboardEmptyState from "./DashboardEmptyState";

export interface DashboardDataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => number | string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DashboardDataTableProps<T> {
  columns: DashboardDataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage: string;
  pageSize?: number;
}

export default function DashboardDataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage,
  pageSize = 8,
}: DashboardDataTableProps<T>) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pagedRows = sortedRows.slice(
    page * pageSize,
    page * pageSize + pageSize,
  );

  const handleSort = (column: DashboardDataTableColumn<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDir("desc");
    }
  };

  if (rows.length === 0) {
    return <DashboardEmptyState message={emptyMessage} />;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(column)}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    {column.header}
                    {sortKey === column.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-3 h-3" aria-hidden="true" />
                      )
                    ) : (
                      <ChevronsUpDown
                        className="w-3 h-3 opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedRows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <p
            className={clsx(
              "text-xs",
              isDark ? "text-gray-500" : "text-gray-400",
            )}
          >
            {t("page_of", { current: page + 1, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
