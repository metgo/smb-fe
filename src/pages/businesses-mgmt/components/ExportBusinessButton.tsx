import * as XLSX from "xlsx";
import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ExportBusinessButtonProps {
  businesses: any[];
  selectedBusinesses: Set<string>;
  columnVisibility: IBusinessColumnVisibility;
  t: (key: string) => string;
}

export default function ExportBusinessButton({
  businesses,
  selectedBusinesses,
  columnVisibility,
  t,
}: ExportBusinessButtonProps) {
  const { isDark } = useThemeClasses();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const getExportData = () =>
    selectedBusinesses.size > 0
      ? businesses.filter((b) => selectedBusinesses.has(b._id))
      : businesses;

  const visibleColumns = (
    Object.entries(columnVisibility) as [
      keyof IBusinessColumnVisibility,
      boolean,
    ][]
  )
    .filter(([_, visible]) => visible)
    .map(([key]) => key);

  const buildRows = (data: any[]) =>
    data.map((business) => {
      const row: Record<string, any> = {};
      for (const key of visibleColumns) {
        let value: any = business[key];
        if (key === "associatedWebsites") {
          value = business.associatedWebsites?.[0]?.url || "-";
        } else if (key === "categories" && Array.isArray(value)) {
          value = value.join(", ");
        } else if (key === "tripCount" && value == null) {
          value = Math.floor((business.productCount * business.impact) / 10);
        }
        row[t(key)] = value ?? "-";
      }
      return row;
    });

  const handleExportCSV = () => {
    const data = getExportData();
    if (!data.length) return;
    const rows = buildRows(data);
    const headers = Object.keys(rows[0]);

    const escapeCSV = (value: any): string => {
      if (value == null) return "";
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => headers.map((h) => escapeCSV(row[h])).join(",")),
    ].join("\n");

    const blob = new Blob(["﻿", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `businesses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const handleExportXLSX = () => {
    const data = getExportData();
    if (!data.length) return;
    const rows = buildRows(data);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Businesses");
    XLSX.writeFile(
      workbook,
      `businesses_export_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    setOpen(false);
  };

  const btnBase = `px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-colors text-sm ${
    isDark
      ? "border-gray-700 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
  }`;

  const menuItem = `flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
    isDark
      ? "hover:bg-gray-700 text-gray-300"
      : "hover:bg-gray-100 text-gray-700"
  }`;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className={btnBase}>
        <Download className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{t("export")}</span>
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1 left-0 z-50 rounded-lg border shadow-lg min-w-36 overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <button onClick={handleExportCSV} className={menuItem}>
            <FileText className="w-4 h-4 shrink-0" />
            CSV
          </button>
          <button onClick={handleExportXLSX} className={menuItem}>
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            XLSX
          </button>
        </div>
      )}
    </div>
  );
}
