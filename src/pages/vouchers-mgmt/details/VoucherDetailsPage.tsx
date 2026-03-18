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

import VoucherTimeline from "./components/VoucherTimeline";
import VoucherTransactionTable from "./components/VoucherTransactionTable";

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
interface VoucherDetailsProps {
  onAddVoucher: () => void;
}
export function VoucherDetailsPage({ onAddVoucher }: VoucherDetailsProps) {
  const { isDark, borderColor } = useThemeClasses();
  const { t } = useTranslation("vouchers");
  const [voucherId, setVoucherId] = useState("");
  const [searchParams] = useSearchParams();
  const [isEditClicked, setIsEditClicked] = useState(false);

  useEffect(() => {
    const voucherId = searchParams.get("voucherId");
    if (voucherId) setVoucherId(voucherId);
  }, [searchParams]);
  const {
    data: voucherdetailId,
    // refetch: voucherRefetch,
    isLoading,
  } = useGetVoucherByIdQuery(voucherId ? { voucherId } : skipToken);
  const voucher = voucherdetailId;

  const [activeTab, setActiveTab] = useState<
    "overview" | "assignee" | "timeline" | "transactions"
  >("overview");

  const timeline: TimelineEvent[] = [
    {
      id: "1",
      type: "created",
      date: voucher?.createdAt,
      description:
        `Created by ${voucher?.creatorInfo?.id?.firstName ?? "-"} ${voucher?.creatorInfo?.id?.lastName ?? ""}`.trim(),
    },
    {
      id: "2",
      type: "assigned",
      date: voucher?.assigneeInfo?.assignedAt,
      description: `Assigned to ${voucher?.assigneeInfo?.name ? voucher?.assigneeInfo?.name : "-"}`,
    },
    {
      id: "3",
      type: "sent_email",
      date: "",
      description: `Voucher sent via email to ${voucher?.assigneeInfo?.email ? voucher?.assigneeInfo?.email : "-"}`,
    },
    {
      id: "4",
      type: "product_purchased",
      date: voucher?.purchaserInfo?.id?.createdAt,
      description: "Purchaser Info",
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

            {/* <button
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              onClick={handleEditClick}
            >
              <Edit className="w-4 h-4" />
              {t("edit")}
            </button> */}
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
            <VoucherTimeline
              timeline={timeline}
              getTimelineIcon={getTimelineIcon}
              formatDate={formatDate}
              t={t}
              isDark={isDark}
            />
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <VoucherTransactionTable
              transactions={transactions}
              isDark={isDark}
              voucher={voucher}
              formatDate={formatDate}
              t={t}
            />
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
      {/* {isEditClicked && (
        <AddVoucherWizard onClose={() => setIsEditClicked(false)} />
      )} */}
    </div>
  );
}
