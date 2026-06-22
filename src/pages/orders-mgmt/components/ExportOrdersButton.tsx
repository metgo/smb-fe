import * as XLSX from "xlsx";
import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

type OrderColumnVisibility = {
  name: boolean;
  email: boolean;
  phone: boolean;
  status: boolean;
  paymentStatus: boolean;
  paymentMethod: boolean;
  totalOrderAmount: boolean;
  productCount: boolean;
  deliveryFee: boolean;
  createdAt: boolean;
  _id: boolean;
  website: boolean;
};

interface ExportOrdersButtonProps {
  orders: any[];
  selectedOrders: Set<string>;
  columnVisibility: OrderColumnVisibility;
  websiteMap: Record<string, any>;
  isSummaryMode: boolean;
  summaryData: any[];
  t: (key: string) => string;
}

export default function ExportOrdersButton({
  orders,
  selectedOrders,
  columnVisibility,
  websiteMap,
  isSummaryMode,
  summaryData,
  t,
}: ExportOrdersButtonProps) {
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

  const escapeCSV = (value: any): string => {
    if (value == null) return "";
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const buildOrderRows = () => {
    const source =
      selectedOrders.size > 0
        ? orders.filter((o) => selectedOrders.has(o._id))
        : orders;

    const visibleKeys = (
      Object.entries(columnVisibility) as [
        keyof OrderColumnVisibility,
        boolean,
      ][]
    )
      .filter(([_, visible]) => visible)
      .map(([key]) => key);

    return source.map((order) => {
      const row: Record<string, any> = {};
      for (const key of visibleKeys) {
        let value: any;
        if (key === "totalOrderAmount") {
          value =
            order.totalAmount != null
              ? `₪${order.totalAmount.toLocaleString()}`
              : "-";
        } else if (key === "deliveryFee") {
          value =
            order.deliveryFee != null
              ? `₪${order.deliveryFee.toLocaleString()}`
              : "-";
        } else if (key === "productCount") {
          value = order.productCount ?? "-";
        } else if (key === "createdAt") {
          value = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "-";
        } else if (key === "paymentMethod") {
          value = Array.isArray(order.paymentMethod)
            ? order.paymentMethod.map((m: string) => t(m)).join(", ")
            : order.paymentMethod || "-";
        } else if (key === "website") {
          const website = websiteMap[order.externalApiId ?? ""];
          value = website?.websiteName ?? "-";
        } else {
          value = order[key];
        }
        row[t(key)] = value ?? "-";
      }
      return row;
    });
  };

  const buildSummaryRows = () =>
    summaryData.map((row) => ({
      [t("business_name")]: row.businessName ?? "-",
      [t("business_address_city")]: row.businessAddressCity ?? "-",
      [t("business_address_location")]: row.businessAddressLocation ?? "-",
      [t("total_no_of_orders")]: row.totalNoOfOrders ?? "-",
      [t("total_amount")]: row.totalAmount
        ? `₪${((row.totalAmount || 0) + (row.totalDeliveryFee || 0)).toLocaleString()}`
        : "-",
      [t("total_amount_paid_by_credit_card")]: row.totalAmountPaidByCreditCard
        ? `₪${row.totalAmountPaidByCreditCard.toLocaleString()}`
        : "-",
    }));

  const handleExportCSV = () => {
    const rows = isSummaryMode ? buildSummaryRows() : buildOrderRows();
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
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
    link.download = `${isSummaryMode ? "summary" : "orders"}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const handleExportXLSX = () => {
    const rows = isSummaryMode ? buildSummaryRows() : buildOrderRows();
    if (!rows.length) return;
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      isSummaryMode ? "Summary" : "Orders",
    );
    XLSX.writeFile(
      workbook,
      `${isSummaryMode ? "summary" : "orders"}_export_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    setOpen(false);
  };

  const btnBase = `flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
    isDark
      ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
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
