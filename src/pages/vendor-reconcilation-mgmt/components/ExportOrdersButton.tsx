import * as XLSX from "xlsx";
import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface MonthlyOrder {
  _id: string;
  orderId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  platformFee: number;
  netToVendor: number;
  status: string;
  reconciliationStatus: string;
  paymentStatus: string;
  externalApiId: string;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: string;
  specialInstructions: string;
  disputeId?: string;
}

interface ExportOrdersButtonProps {
  orders: MonthlyOrder[];
  selectedOrders: Set<string>;
  t: (key: string) => string;
}

export default function ExportOrdersButton({
  orders,
  selectedOrders,
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

  const getExportData = () => {
    const source =
      selectedOrders.size > 0
        ? orders.filter((o) => selectedOrders.has(o._id))
        : orders;
    return source;
  };

  const buildRows = (data: MonthlyOrder[]) =>
    data.map((order) => ({
      [t("order_id")]: order.orderId,
      [t("product")]: order.productName,
      [t("customer")]: order.customerName,
      [t("email")]: order.customerEmail,
      [t("phone")]: order.customerPhone || "-",
      [t("date")]: order.purchaseDate
        ? new Date(order.purchaseDate).toLocaleDateString()
        : "-",
      [t("quantity")]: order.quantity,
      [t("unit_price")]: order.unitPrice,
      [t("total")]: order.totalPrice,
      [t("platform_fee")]: order.platformFee,
      [t("net_to_vendor")]: order.netToVendor,
      [t("status")]: order.status,
      [t("reconciliation_status")]: order.reconciliationStatus,
      [t("payment_method")]: order.paymentMethod || "-",
      [t("delivery_method")]: order.deliveryMethod || "-",
      [t("delivery_address")]: order.deliveryAddress || "-",
    }));

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
    link.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(
      workbook,
      `orders_export_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    setOpen(false);
  };

  const btnBase = `px-4 py-2 rounded-lg border flex items-center gap-1.5 transition-colors text-sm ${
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
