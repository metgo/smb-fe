import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Send,
  XCircle,
  RefreshCw,
  Tag,
  Globe,
  User,
  Clock,
  Package,
  MapPin,
  Gift,
  TrendingUp,
} from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetVoucherByIdQuery } from "@/store/api/voucherQueryApi";
import { useSearchParams } from "react-router-dom";

interface VoucherDetailsProps {
  // voucherId: string;
  // language: Language;
  // theme: Theme;
  onClose: () => void;
  onVoucherUpdated: () => void;
}

interface VoucherDetail {
  id: string;
  code: string;
  status: "active" | "assigned" | "redeemed" | "expired" | "cancelled";
  type: "monetary" | "percentage";
  amount: number;
  remainingAmount: number;
  expirationDate: string;
  campaign: string;
  websites: string[];
  paymentStatus: "pending" | "completed" | "refunded";
  assigneeName: string;
  assigneeEmail: string;
  assigneePhone: string;
  assignedAt: string;
  createdAt: string;
  creatorName: string;
  creatorEmail: string;
}

interface TimelineEvent {
  id: string;
  type:
    | "created"
    | "assigned"
    | "sent_email"
    | "sent_sms"
    | "product_purchased"
    | "trip_used"
    | "fun_day_used"
    | "partial_redemption"
    | "refund"
    | "expiration_extended";
  date: string;
  description: string;
  amount?: number;
  linkedId?: string;
  linkedType?: "order" | "product" | "trip" | "funday" | "campaign";
  linkedName?: string;
}

interface Transaction {
  id: string;
  type: "product" | "trip" | "funday" | "refund";
  referenceId: string;
  referenceName: string;
  amountUsed: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

export function VoucherDetailsPage({
  // voucherId,

  onClose,
  // onVoucherUpdated,
}: VoucherDetailsProps) {
  const [voucherId, setVoucherId] = useState("");
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const voucherId = searchParams.get("voucherId");
    if (voucherId) setVoucherId(voucherId);
  }, [searchParams]);
  const {
    data: voucher,
    // refetch: voucherRefetch,
    // isLoading,
  } = useGetVoucherByIdQuery(voucherId ? { voucherId } : skipToken);
  console.log("🚀 ~ VoucherDetailsPage ~ voucherDetail:", voucher);

  const [activeTab, setActiveTab] = useState<
    "overview" | "assignee" | "timeline" | "transactions"
  >("overview");

  // Mock data
  // const voucher: VoucherDetail = {
  //   id: voucherId,
  //   code: "VCH-000042",
  //   status: "assigned",
  //   type: "monetary",
  //   amount: 500,
  //   remainingAmount: 350,
  //   expirationDate: "2026-03-15",
  //   campaign: "Summer Sale 2024",
  //   websites: ["visitnegev.com", "explorenegev.il"],
  //   paymentStatus: "completed",
  //   assigneeName: "Sarah Cohen",
  //   assigneeEmail: "sarah.cohen@example.com",
  //   assigneePhone: "+972-54-1234567",
  //   assignedAt: "2026-01-15T10:30:00Z",
  //   createdAt: "2026-01-15T09:00:00Z",
  //   creatorName: "Admin User",
  //   creatorEmail: "admin@metgo.app",
  // };

  const timeline: TimelineEvent[] = [
    {
      id: "1",
      type: "created",
      date: "2026-01-15T09:00:00Z",
      description: "Voucher created by Admin User",
    },
    {
      id: "2",
      type: "assigned",
      date: "2026-01-15T10:30:00Z",
      description: "Assigned to Sarah Cohen",
    },
    {
      id: "3",
      type: "sent_email",
      date: "2026-01-15T10:31:00Z",
      description: "Voucher sent via email to sarah.cohen@example.com",
    },
    {
      id: "4",
      type: "product_purchased",
      date: "2026-01-20T14:22:00Z",
      description: "Used for product purchase",
      amount: 150,
      linkedId: "PRD-123",
      linkedType: "product",
      linkedName: "Desert Tour Premium Package",
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      type: "product",
      referenceId: "PRD-123",
      referenceName: "Desert Tour Premium Package",
      amountUsed: 150,
      date: "2026-01-20T14:22:00Z",
      status: "completed",
    },
  ];

  const getStatusColor = (status: VoucherDetail["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "assigned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "redeemed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "expired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
  };

  const getStatusLabel = (status: VoucherDetail["status"]) => {
    const labels = {
      active: "Active",
      assigned: "Assigned",
      redeemed: "Redeemed",
      expired: "Expired",
      cancelled: "Cancelled",
    };
    return labels[status];
  };

  const isExpiringSoon = (date: string) => {
    const daysUntilExpiry = Math.floor(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimelineIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "created":
        return <Tag className="w-4 h-4" />;
      case "assigned":
        return <User className="w-4 h-4" />;
      case "sent_email":
        return <Mail className="w-4 h-4" />;
      case "sent_sms":
        return <Phone className="w-4 h-4" />;
      case "product_purchased":
        return <Package className="w-4 h-4" />;
      case "trip_used":
        return <MapPin className="w-4 h-4" />;
      case "fun_day_used":
        return <Gift className="w-4 h-4" />;
      case "partial_redemption":
        return <TrendingUp className="w-4 h-4" />;
      case "refund":
        return <RefreshCw className="w-4 h-4" />;
      case "expiration_extended":
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    const labels = {
      product: "Product",
      trip: "Trip",
      funday: "Fun Day",
      refund: "Refund",
    };
    return labels[type];
  };

  const getTransactionTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "product":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "trip":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "funday":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      case "refund":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    }
  };

  return (
    <div className="flex-1 flec flex-col">
      {/* Fixed Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">
                  {voucher?.code}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {voucher?.campaign}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(voucher?.status)}`}
              >
                {getStatusLabel(voucher?.status)}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm transition-colors ${
                activeTab === "overview"
                  ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("assignee")}
              className={`px-4 py-2 text-sm transition-colors ${
                activeTab === "assignee"
                  ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Assignee & Creator
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 text-sm transition-colors ${
                activeTab === "timeline"
                  ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Usage Timeline
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-4 py-2 text-sm transition-colors ${
                activeTab === "transactions"
                  ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Transactions & Usage
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Voucher Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Voucher Code
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {voucher?.code}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Type
                      </label>
                      <div className="text-gray-900 dark:text-gray-100 capitalize">
                        {voucher?.type}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Campaign
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {voucher?.campaign}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Payment Status
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          voucher?.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : voucher?.paymentStatus === "refunded"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {voucher?.paymentStatus?.charAt(0).toUpperCase() +
                          voucher?.paymentStatus?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Financial Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Original Amount
                      </label>
                      <div className="text-2xl text-gray-900 dark:text-gray-100">
                        ₪{voucher?.amount}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Remaining Amount
                      </label>
                      <div className="text-2xl text-teal-600 dark:text-teal-400">
                        ₪{voucher?.remainingAmount}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Used Amount
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        ₪{voucher?.amount - voucher?.remainingAmount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Expiration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Expiration Date
                      </label>
                      <div
                        className={`flex items-center gap-2 ${
                          isExpired(voucher?.expireDate)
                            ? "text-red-600 dark:text-red-400"
                            : isExpiringSoon(voucher?.expireDate)
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        <Calendar className="w-5 h-5" />
                        <span>{voucher?.expireDate}</span>
                      </div>
                      {isExpiringSoon(voucher?.expireDate) &&
                        !isExpired(voucher?.expireDate) && (
                          <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expiring soon (≤30 days)
                          </div>
                        )}
                      {isExpired(voucher?.expireDate) && (
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                          This voucher has expired
                        </div>
                      )}
                    </div>
                    <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Extend Expiration Date
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Applicable Websites
                  </h3>
                  <div className="space-y-2">
                    {voucher?.websites?.map((website: any, index: any) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-900 dark:text-gray-100"
                      >
                        <Globe className="w-4 h-4 text-gray-400" />
                        {website}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignee & Creator Tab */}
          {activeTab === "assignee" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Assignee Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Name
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {voucher?.assigneeName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Email
                      </label>
                      <a
                        href={`mailto:${voucher?.assigneeEmail}`}
                        className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {voucher?.assigneeEmail}
                      </a>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Phone
                      </label>
                      <a
                        href={`tel:${voucher?.assigneePhone}`}
                        className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {voucher?.assigneePhone}
                      </a>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Assigned At
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {formatDate(voucher?.assignedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Creator Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Created By
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {voucher?.creatorName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Creator Email
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {voucher?.creatorEmail}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Created At
                      </label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {formatDate(voucher?.createdAt)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                        System Generated
                      </label>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        Via Admin Console
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Activity Timeline
              </h3>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        {getTimelineIcon(event.type)}
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 mt-2 mb-2"
                          style={{ minHeight: "20px" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-gray-100">
                            {event.description}
                          </p>
                          {event.amount && (
                            <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                              Amount: ₪{event.amount}
                            </p>
                          )}
                          {event.linkedName && (
                            <a
                              href="#"
                              className="text-sm text-teal-600 dark:text-teal-400 hover:underline mt-1 inline-block"
                            >
                              → {event.linkedName}
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(event.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm text-gray-600 dark:text-gray-400">
                  Transaction History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                        Reference ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                        Amount Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTransactionTypeColor(transaction.type)}`}
                          >
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href="#"
                            className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            {transaction.referenceId}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {transaction.referenceName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            ₪{transaction.amountUsed}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : transaction.status === "cancelled"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            }`}
                          >
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No transactions found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Extend Expiration
          </button>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Change Status
          </button>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" />
            Re-send Voucher
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancel Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
