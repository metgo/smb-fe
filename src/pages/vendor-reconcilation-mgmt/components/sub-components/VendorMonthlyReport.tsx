import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  AlertCircle,
  FileText,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { generateMockMonthlyOrders } from "@/helpers/mockMonthlyOrders";
import OrderDetailsModal from "./OrderDetailsModal";
import DisputeModal from "./DisputeModal";
import CancelOrderModal from "./CancelOrderModal";

import { AdminDisputeResponseModal } from "./AdminDisputeReponseModal";
import { useAppSelector } from "@/hooks/hooks";

interface VendorMonthlyReportProps {
  vendorId?: string;
  adminView?: boolean;
}

export interface MonthlyOrder {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSKU: string;
  productCategory: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  platformFee: number;
  netToVendor: number;
  status: "pending" | "approved" | "disputed" | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  deliveryMethod: string;
  deliveryAddress: string;
  specialInstructions?: string;
  transactionId: string;
  disputeInfo?: {
    id: string;
    reason: string;
    details: string;
    files: string[];
    submittedAt: string;
    adminResponse?: string;
    respondedAt?: string;
    resolution?: "approved" | "denied" | "partial" | "pending";
  };
  cancelInfo?: {
    reason: string;
    notes?: string;
    cancelledAt: string;
    cancelledBy: string;
  };
  approvedAt?: string;
  approvedBy?: string;
}

export const VendorMonthlyReport = ({
  vendorId = "vendor-1",
  adminView = false,
}: VendorMonthlyReportProps) => {
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const [orders, setOrders] = useState<MonthlyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MonthlyOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAdminDisputeModal, setShowAdminDisputeModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("10-2026"); // October 2026
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  // Text color utilities
  const textPrimary = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const bgPrimary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const hoverBg = theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
    priceMin: "",
    priceMax: "",
    product: "all",
    customer: "all",
  });

  // Load mock data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockOrders = generateMockMonthlyOrders(150, vendorId);
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, [vendorId, selectedMonth]);

  // Close month picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target as Node)
      ) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const platformFees = orders.reduce((sum, o) => sum + o.platformFee, 0);
    const netPayout = orders
      .filter((o) => o.status === "approved")
      .reduce((sum, o) => sum + o.netToVendor, 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const approved = orders.filter((o) => o.status === "approved").length;
    const disputed = orders.filter((o) => o.status === "disputed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const heldForDisputes = orders
      .filter((o) => o.status === "disputed")
      .reduce((sum, o) => sum + o.netToVendor, 0);

    return {
      totalOrders,
      totalRevenue,
      platformFees,
      netPayout,
      pending,
      approved,
      disputed,
      cancelled,
      heldForDisputes,
    };
  }, [orders]);

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          order.id.toLowerCase().includes(search) ||
          order.productName.toLowerCase().includes(search) ||
          order.customerName.toLowerCase().includes(search) ||
          order.customerEmail.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && order.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const orderDate = new Date(order.purchaseDate);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const orderDate = new Date(order.purchaseDate);
        const toDate = new Date(filters.dateTo);
        if (orderDate > toDate) return false;
      }

      // Price range filter
      if (filters.priceMin && order.totalPrice < parseFloat(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && order.totalPrice > parseFloat(filters.priceMax)) {
        return false;
      }

      return true;
    });
  }, [orders, searchTerm, filters]);

  // Handle actions
  const handleApprove = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "approved",
              approvedAt: new Date().toISOString(),
              approvedBy: "current-user",
            }
          : o,
      ),
    );
    toast.success("Order approved successfully!", {
      action: {
        label: "Undo",
        onClick: () => handleUndo(orderId),
      },
    });
  };

  const handleBulkApprove = () => {
    const selectedIds = Array.from(selectedOrders);
    setOrders((prev) =>
      prev.map((o) =>
        selectedIds.includes(o.id) && o.status === "pending"
          ? {
              ...o,
              status: "approved",
              approvedAt: new Date().toISOString(),
              approvedBy: "current-user",
            }
          : o,
      ),
    );
    toast.success(`${selectedIds.length} orders approved successfully!`);
    setSelectedOrders(new Set());
  };

  const handleApproveAll = () => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    setOrders((prev) =>
      prev.map((o) =>
        o.status === "pending"
          ? {
              ...o,
              status: "approved",
              approvedAt: new Date().toISOString(),
              approvedBy: "current-user",
            }
          : o,
      ),
    );
    toast.success(`All ${pendingCount} pending orders approved!`);
  };

  const handleUndo = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "pending",
              approvedAt: undefined,
              approvedBy: undefined,
            }
          : o,
      ),
    );
    toast.info("Approval undone");
  };

  const handleOpenDispute = (order: MonthlyOrder) => {
    setSelectedOrder(order);
    setShowDisputeModal(true);
  };

  const handleSubmitDispute = (
    reason: string,
    details: string,
    files: File[],
  ) => {
    if (!selectedOrder) return;

    const disputeInfo = {
      id: `D-${Date.now()}`,
      reason,
      details,
      files: files.map((f) => f.name),
      submittedAt: new Date().toISOString(),
      resolution: "pending" as const,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, status: "disputed", disputeInfo }
          : o,
      ),
    );

    toast.success("Dispute submitted successfully", {
      description: "Admin will review your dispute shortly.",
    });
    setShowDisputeModal(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = (order: MonthlyOrder) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleSubmitCancel = (reason: string, notes: string) => {
    if (!selectedOrder) return;

    const cancelInfo = {
      reason,
      notes,
      cancelledAt: new Date().toISOString(),
      cancelledBy: "current-user",
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, status: "cancelled", cancelInfo }
          : o,
      ),
    );

    toast.success("Order cancelled successfully");
    setShowCancelModal(false);
    setSelectedOrder(null);
  };

  const handleViewDetails = (order: MonthlyOrder) => {
    setSelectedOrder(order);
    if (adminView && order.status === "disputed") {
      setShowAdminDisputeModal(true);
    } else {
      setShowOrderDetails(true);
    }
  };

  const handleAdminResolveDispute = (
    // resolution: string,
    response: string,
    action: string,
  ) => {
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id && o.disputeInfo
          ? {
              ...o,
              status: action === "approve_dispute" ? "cancelled" : "approved",
              disputeInfo: {
                ...o.disputeInfo,
                adminResponse: response,
                respondedAt: new Date().toISOString(),
                resolution:
                  action === "approve_dispute"
                    ? "approved"
                    : action === "deny_dispute"
                      ? "denied"
                      : "partial",
              },
            }
          : o,
      ),
    );

    toast.success("Dispute resolved successfully");
    setShowAdminDisputeModal(false);
    setSelectedOrder(null);
  };

  const handleExportCSV = () => {
    // CSV export logic
    toast.success("Report exported to CSV");
  };

  const handleExportPDF = () => {
    // PDF export logic
    toast.success("Report exported to PDF");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingOrders = filteredOrders
        .filter((o) => o.status === "pending")
        .map((o) => o.id);
      setSelectedOrders(new Set(pendingOrders));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        text: "text-yellow-800 dark:text-yellow-400",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-800 dark:text-green-400",
        icon: CheckCircle,
        label: "Approved",
      },
      disputed: {
        bg: "bg-orange-100 dark:bg-orange-900/20",
        text: "text-orange-800 dark:text-orange-400",
        icon: AlertTriangle,
        label: "Disputed",
      },
      cancelled: {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-800 dark:text-red-400",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={textSecondary}>Loading monthly report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>
              {adminView ? "Vendor Monthly Report" : "Monthly Report"}
            </h1>
            <p className={textTertiary}>
              Review and approve your orders for {selectedMonth}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className={`px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textSecondary} flex items-center gap-2 transition-colors`}
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className={`px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textSecondary} flex items-center gap-2 transition-colors`}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <div className="relative" ref={monthPickerRef}>
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textSecondary} flex items-center gap-2 transition-colors`}
              >
                <Calendar className="w-4 h-4" />
                {selectedMonth}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showMonthPicker && (
                <div
                  className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 ${bgPrimary} border ${borderColor} rounded-lg shadow-lg p-4 z-10 w-64`}
                >
                  <div className="space-y-2">
                    {[
                      "11-2026",
                      "10-2026",
                      "09-2026",
                      "08-2026",
                      "07-2026",
                      "06-2026",
                    ].map((month) => (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          setShowMonthPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded ${hoverBg} ${textSecondary} ${
                          selectedMonth === month
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : ""
                        }`}
                      >
                        {month === "11-2026" && "(Current) "}
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <div className={`text-xs ${textTertiary} mb-1`}>Total Orders</div>
            <div className={`text-2xl font-bold ${textPrimary}`}>
              {stats.totalOrders}
            </div>
          </div>
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <div className={`text-xs ${textTertiary} mb-1`}>Total Revenue</div>
            <div className={`text-2xl font-bold ${textPrimary}`}>
              {formatCurrency(stats.totalRevenue)}
            </div>
          </div>
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <div className={`text-xs ${textTertiary} mb-1`}>Platform Fee</div>
            <div
              className={`text-2xl font-bold text-orange-600 dark:text-orange-400`}
            >
              -{formatCurrency(stats.platformFees)}
            </div>
          </div>
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <div className={`text-xs ${textTertiary} mb-1`}>Net Payout</div>
            <div
              className={`text-2xl font-bold text-green-600 dark:text-green-400`}
            >
              {formatCurrency(stats.netPayout)}
            </div>
          </div>
          <div className={`${bgSecondary} rounded-lg p-4 col-span-2`}>
            <div className={`text-xs ${textTertiary} mb-2`}>
              Status Overview
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className={textSecondary}>{stats.pending} Pending</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className={textSecondary}>{stats.approved} Approved</span>
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className={textSecondary}>{stats.disputed} Disputed</span>
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className={textSecondary}>
                  {stats.cancelled} Cancelled
                </span>
              </span>
            </div>
          </div>
        </div>

        {stats.heldForDisputes > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p
                className={`text-sm font-medium text-orange-900 dark:text-orange-200`}
              >
                {formatCurrency(stats.heldForDisputes)} held for disputes
              </p>
              <p
                className={`text-xs text-orange-700 dark:text-orange-300 mt-1`}
              >
                These amounts will be paid after dispute resolution
              </p>
            </div>
          </div>
        )}

        {!adminView && stats.pending > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p
                className={`text-sm font-medium text-yellow-900 dark:text-yellow-200`}
              >
                Deadline: November 7, 2026 (5 days remaining)
              </p>
              <p
                className={`text-xs text-yellow-700 dark:text-yellow-300 mt-1`}
              >
                Orders not reviewed by the deadline will be automatically
                approved
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions and Search Bar */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 mb-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
              />
              <input
                type="text"
                placeholder="Search orders by ID, product, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textSecondary} flex items-center gap-2 transition-colors`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
          {!adminView && (
            <div className="flex items-center gap-2">
              {selectedOrders.size > 0 && (
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Selected ({selectedOrders.size})
                </button>
              )}
              {stats.pending > 0 && (
                <button
                  onClick={handleApproveAll}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve All Pending
                </button>
              )}
              <button
                onClick={() => {
                  setFilters({ ...filters, status: "disputed" });
                }}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textSecondary} flex items-center gap-2 transition-colors`}
              >
                <AlertTriangle className="w-4 h-4" />
                View Disputes ({stats.disputed})
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className={`mt-4 pt-4 border-t ${borderColor} grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4`}
          >
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                Min Price
              </label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) =>
                  setFilters({ ...filters, priceMin: e.target.value })
                }
                placeholder="$0"
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                Max Price
              </label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters({ ...filters, priceMax: e.target.value })
                }
                placeholder="$1000"
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div
        className={`${bgPrimary} rounded-lg border ${borderColor} overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${bgSecondary} border-b ${borderColor}`}>
              <tr>
                {!adminView && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.size > 0 &&
                        selectedOrders.size ===
                          filteredOrders.filter((o) => o.status === "pending")
                            .length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th
                  className={`px-4 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium ${textTertiary} uppercase tracking-wider`}
                >
                  Product
                </th>
                <th
                  className={`px-4 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium ${textTertiary} uppercase tracking-wider`}
                >
                  Customer
                </th>
                <th
                  className={`px-4 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium ${textTertiary} uppercase tracking-wider`}
                >
                  Date
                </th>
                <th
                  className={`px-4 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium ${textTertiary} uppercase tracking-wider`}
                >
                  Qty
                </th>
                <th
                  className={`px-4 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium ${textTertiary} uppercase tracking-wider`}
                >
                  Price
                </th>
                <th
                  className={`px-4 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium ${textTertiary} uppercase tracking-wider`}
                >
                  Status
                </th>
                <th
                  className={`px-4 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium ${textTertiary} uppercase tracking-wider`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`${hoverBg} cursor-pointer transition-colors`}
                  onClick={() => handleViewDetails(order)}
                >
                  {!adminView && (
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {order.status === "pending" && (
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <div className={`font-medium ${textPrimary}`}>
                          {order.productName}
                        </div>
                        <div className={`text-xs ${textTertiary}`}>
                          SKU: {order.productSKU}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className={`font-medium ${textPrimary}`}>
                        {order.customerName}
                      </div>
                      <div className={`text-xs ${textTertiary}`}>
                        {order.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-sm ${textSecondary}`}>
                    {formatDate(order.purchaseDate)}
                  </td>
                  <td className={`px-4 py-4 text-sm ${textSecondary}`}>
                    {order.quantity}
                  </td>
                  <td className="px-4 py-4">
                    <div className={`font-medium ${textPrimary}`}>
                      {formatCurrency(order.totalPrice)}
                    </div>
                    <div className={`text-xs ${textTertiary}`}>
                      Fee: {formatCurrency(order.platformFee)}
                    </div>
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                  <td
                    className="px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      {!adminView && order.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDispute(order)}
                            className="p-1.5 rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            title="Dispute"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {adminView && order.status === "disputed" && (
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          Respond
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className={`w-12 h-12 ${textTertiary} mx-auto mb-3`} />
              <p className={`text-lg ${textSecondary} mb-1`}>No orders found</p>
              <p className={`text-sm ${textTertiary}`}>
                {searchTerm || filters.status !== "all"
                  ? "Try adjusting your filters or search term"
                  : "Orders will appear here once customers make purchases"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onDispute={() => {
            setShowOrderDetails(false);
            setShowDisputeModal(true);
          }}
          onCancel={() => {
            setShowOrderDetails(false);
            setShowCancelModal(true);
          }}
          onApprove={() => {
            handleApprove(selectedOrder.id);
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          adminView={adminView}
        />
      )}

      {showDisputeModal && selectedOrder && (
        <DisputeModal
          order={selectedOrder}
          theme={theme}
          onClose={() => {
            setShowDisputeModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmitDispute}
        />
      )}

      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmitCancel}
        />
      )}

      {showAdminDisputeModal && selectedOrder && (
        <AdminDisputeResponseModal
          order={selectedOrder}
          onClose={() => {
            setShowAdminDisputeModal(false);
            setSelectedOrder(null);
          }}
          onResolve={handleAdminResolveDispute}
        />
      )}
    </div>
  );
};
