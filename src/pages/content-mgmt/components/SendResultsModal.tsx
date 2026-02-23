import React from "react";
import { X, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SendResult {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  emailStatus: "success" | "failed" | "skipped";
  smsStatus: "success" | "failed" | "skipped";
  errorMessage?: string;
}

interface SendResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SendResult[];
  theme: "light" | "dark";
}

export function SendResultsModal({
  isOpen,
  onClose,
  results,
  theme,
}: SendResultsModalProps) {
  const isDark = theme === "dark";

  if (!isOpen) return null;

  const successCount = results.filter(
    (r) => r.emailStatus === "success" || r.smsStatus === "success",
  ).length;
  const failedCount = results.filter(
    (r) => r.emailStatus === "failed" || r.smsStatus === "failed",
  ).length;

  const handleDownloadCSV = () => {
    const headers = [
      "Customer ID",
      "Customer Name",
      "Email",
      "Phone",
      "Email Status",
      "SMS Status",
      "Error Message",
    ];
    const rows = results.map((r) => [
      r.customerId,
      r.customerName,
      r.email,
      r.phone,
      r.emailStatus,
      r.smsStatus,
      r.errorMessage || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `message-results-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: "success" | "failed" | "skipped") => {
    switch (status) {
      case "success":
        return (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "skipped":
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: "success" | "failed" | "skipped") => {
    const variants = {
      success:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      failed: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      skipped: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl ${
          isDark
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
            >
              Message Delivery Results
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {successCount} successful
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {failedCount} failed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total: {results.length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <table className="w-full">
            <thead
              className={`sticky top-0 ${
                isDark
                  ? "bg-gray-800 border-b border-gray-700"
                  : "bg-gray-50 border-b border-gray-200"
              }`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Customer
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Contact
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Email Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  SMS Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Error
                </th>
              </tr>
            </thead>
            <tbody className={isDark ? "bg-gray-900" : "bg-white"}>
              {results.map((result, index) => (
                <tr
                  key={result.customerId}
                  className={`${
                    index % 2 === 0
                      ? isDark
                        ? "bg-gray-900"
                        : "bg-white"
                      : isDark
                        ? "bg-gray-800/50"
                        : "bg-gray-50"
                  } border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
                          {result.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div
                          className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
                        >
                          {result.customerName}
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                        >
                          ID: {result.customerId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {result.email}
                    </div>
                    <div
                      className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {result.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.emailStatus)}
                      {getStatusBadge(result.emailStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.smsStatus)}
                      {getStatusBadge(result.smsStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {result.errorMessage && (
                      <span
                        className={`text-xs ${isDark ? "text-red-400" : "text-red-600"}`}
                      >
                        {result.errorMessage}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end p-6 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
