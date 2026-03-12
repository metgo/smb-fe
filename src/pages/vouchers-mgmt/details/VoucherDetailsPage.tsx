import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Send,
  XCircle,
  RefreshCw,
  Tag,
  User,
  Package,
  MapPin,
  Gift,
  TrendingUp,
  Edit,
} from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetVoucherByIdQuery } from "@/store/api/voucherQueryApi";
import { useSearchParams } from "react-router-dom";
import { BackToListBtn } from "@/components/btns";
import { routes } from "@/lib/routes";
import { formatDate, getStatusColor, getStatusLabel } from "@/helpers";
import VoucherOverview from "../details/components/VoucherOverview";
import VoucherAssigneeCreator from "../details/components/VoucherAssigneeCreator";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/shared";
import clsx from "clsx";

// interface VoucherDetail {
//   id: string;
//   code: string;
//   status: "active" | "assigned" | "redeemed" | "expired" | "cancelled";
//   type: "monetary" | "percentage";
//   amount: number;
//   remainingAmount: number;
//   expirationDate: string;
//   campaign: string;
//   websites: string[];
//   paymentStatus: "pending" | "completed" | "refunded";
//   assigneeName: string;
//   assigneeEmail: string;
//   assigneePhone: string;
//   assignedAt: string;
//   createdAt: string;
//   creatorName: string;
//   creatorEmail: string;
// }

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

export function VoucherDetailsPage() {
  const { isDark, borderColor } = useThemeClasses();
  const { t } = useTranslation("vouchers");
  const [voucherId, setVoucherId] = useState("");
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const voucherId = searchParams.get("voucherId");
    if (voucherId) setVoucherId(voucherId);
  }, [searchParams]);
  const {
    data: voucherdetailId,
    // refetch: voucherRefetch,
    isLoading,
  } = useGetVoucherByIdQuery(voucherId ? { voucherId } : skipToken);
  const voucher = voucherdetailId?.datas;

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

  const isExpiringSoon = (date: string) => {
    const daysUntilExpiry = Math.floor(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
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
    <div className=" flex flex-col overflow-hidden relative h-[88vh] ">
      <Spinner isLoading={isLoading} /> {/* Fixed Header */}
      <div className={clsx(` shrink-0 border-b px-6 py-4 `, borderColor)}>
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <BackToListBtn navPath={routes.voucherMgmt} />

          <div className="flex items-center gap-2">
            {/* <StatusChangeBtn
              handleStatusChange={onStatusChangeHandler}
              status={voucher?.status}
            /> */}

            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
              <Edit className="w-4 h-4" />
              {t("edit")}
            </button>
          </div>
        </div>
        <div>
          <div className="px-4">
            <h1 className={` ${isDark ? "text-gray-300" : "text-gray-900"} `}>
              {voucher?.code}
            </h1>
            <p className={` ${isDark ? "text-gray-300" : "text-gray-900"} `}>
              {voucher?.campaign ? voucher?.campaign : "-"}
            </p>
          </div>{" "}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full ml-2 mt-1 text-sm ${getStatusColor(voucher?.status)}`}
            >
              {getStatusLabel(voucher?.status)}
            </span>
          </div>
        </div>

        {/* <PageStats
          stats={businessStats}
          isLoading={isDetailStatsLoading}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 mt-3 gap-4"
        /> */}
      </div>
      <div className={`flex gap-1 border-b sticky top-0 z-10 px-4`}>
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === "overview"
              ? `${
                  isDark
                    ? "text-teal-400 border-teal-400"
                    : "text-teal-600 border-teal-600"
                } border-b-2`
              : `${isDark ? "text-gray-400 hover:text-gray-100" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          {t("overview")}
        </button>

        <button
          onClick={() => setActiveTab("assignee")}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === "assignee"
              ? `${
                  isDark
                    ? "text-teal-400 border-teal-400"
                    : "text-teal-600 border-teal-600"
                } border-b-2`
              : `${isDark ? "text-gray-400 hover:text-gray-100" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          {t("assignee_and_creator")}
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === "timeline"
              ? `${
                  isDark
                    ? "text-teal-400 border-teal-400"
                    : "text-teal-600 border-teal-600"
                } border-b-2`
              : `${isDark ? "text-gray-400 hover:text-gray-100" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          {t("usage_timeline")}
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === "transactions"
              ? `${
                  isDark
                    ? "text-teal-400 border-teal-400"
                    : "text-teal-600 border-teal-600"
                } border-b-2`
              : `${isDark ? "text-gray-400 hover:text-gray-100" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          {t("transactions_and_usage")}
        </button>
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <VoucherOverview
              voucher={voucher}
              isDark={isDark}
              isExpired={isExpired}
              isExpiringSoon={isExpiringSoon}
              t={t}
            />
          )}

          {/* Assignee & Creator Tab */}
          {activeTab === "assignee" && (
            <VoucherAssigneeCreator
              voucher={voucher}
              isDark={isDark}
              formatDate={formatDate}
              t={t}
            />
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
      <div
        className={`px-6 py-4 border-t rounded-sm flex items-center justify-end gap-3 `}
      >
        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-colors ${
            isDark
              ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          {t("extend_expiration")}
        </button>

        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-colors ${
            isDark
              ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          {t("change_status")}
        </button>

        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-colors ${
            isDark
              ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Send className="w-4 h-4" />
          {t("re_send_voucher")}
        </button>

        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {t("cancel_voucher")}
        </button>
      </div>
    </div>
  );
}
