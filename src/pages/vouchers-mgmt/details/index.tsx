import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";

import {
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Tag,
  User,
  Package,
  MapPin,
  Gift,
  TrendingUp,
  Send,
  UserPlus,
  Clock,
  Copy,
  Check as CheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { routes } from "@/lib/routes";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetVoucherByIdQuery } from "@/store/api/voucherQueryApi";
import {
  useSendEmailMutation,
  useSendSMSMutation,
} from "@/store/api/voucherMutationApi";
import { BackToListBtn } from "@/components/btns";
import { formatDate, getStatusColor, getStatusLabel } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Spinner, TabsSection } from "@/components/shared";

import { useGetAllOrdersQuery } from "@/store/api/orderQueryApi";
import {
  AssignVoucherModal,
  VoucherAssigneeCreator,
  VoucherOverview,
  VoucherTransactionTable,
  VoucherUsageTimeline,
} from "./components";
import { voucherTabs } from "@/constants/tabs";

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

interface Order {
  _id: string;
  orderId: string;
  product: {
    _id: string;
    name: string;
    image?: { image: string };
    business_info?: { name: string };
  };
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAmount: number;
  amount: number;
  quantity: number;
  paymentDate: string;
  createdAt: string;
  itemType: string;
}

export default function VoucherDetailsPage() {
  const { t } = useTranslation("vouchers");
  const [searchParams] = useSearchParams();
  const { isDark } = useThemeClasses();
  const { isSuperadmin } = useUserRoles();

  const [sendEmail] = useSendEmailMutation();
  const [sendSMS] = useSendSMSMutation();

  const handleSendEmail = async () => {
    if (!voucherId) return;
    try {
      await sendEmail({ voucherIds: [voucherId] }).unwrap();
      toast.success("Email sent successfully");
    } catch {
      toast.error("Failed to send email");
    }
  };

  const handleSendSMS = async () => {
    if (!voucherId) return;
    try {
      await sendSMS({ voucherIds: [voucherId] }).unwrap();
      toast.success("SMS sent successfully");
    } catch {
      toast.error("Failed to send SMS");
    }
  };

  const [voucherId, setVoucherId] = useState("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!voucher?.code) return;
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const voucherId = searchParams.get("voucherId");
    if (voucherId) setVoucherId(voucherId);
  }, [searchParams]);

  const {
    data: voucher,
    refetch: refetchVoucher,
    isLoading,
  } = useGetVoucherByIdQuery(voucherId ? { voucherId } : skipToken);

  const { data: orders, isLoading: isOrderLoading } = useGetAllOrdersQuery(
    { voucherId: voucher?._id },

    { skip: !voucher?._id },
  );
  const [ordersFromVoucher, setOrdersfromVoucher] = useState<Order[]>([]);

  useEffect(() => {
    setOrdersfromVoucher(orders?.data || []);
  }, [orders]);

  const createdEvent: TimelineEvent = {
    id: "1",
    type: "created",
    date: voucher?.createdAt,
    description: t("created_byy", {
      firstName: voucher?.creatorInfo?.id?.firstName ?? "-",
      lastName: voucher?.creatorInfo?.id?.lastName ?? "",
    }).trim(),
  };

  const assignedEvent: TimelineEvent = {
    id: "2",
    type: "assigned",
    date: voucher?.assigneeInfo?.assignedAt,
    description: t("assigned_to", {
      name: voucher?.assigneeInfo?.name ?? "-",
    }),
  };

  const sentEmailEvent: TimelineEvent = {
    id: "3",
    type: "sent_email",
    date: "",
    description: t("voucher_sent_email", {
      email: voucher?.assigneeInfo?.email ?? "-",
    }),
  };

  const productPurchasedEvent: TimelineEvent[] = (ordersFromVoucher ?? []).map(
    (order) => ({
      id: order?._id,
      type: "product_purchased" as const,
      date: order.createdAt,
      description: t("purchaser_info"),
      amount: order.amount,
      linkedId: order._id,
      linkedType: order?.itemType as TimelineEvent["linkedType"],
      linkedName: order.product?.name,
    }),
  );

  const timeline: TimelineEvent[] = [
    createdEvent,
    assignedEvent,
    sentEmailEvent,
    ...productPurchasedEvent,
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

  const getTimelineIcon = (type: string) => {
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

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative">
      <Spinner isLoading={isLoading} /> {/* Fixed Header */}
      {/* Fixed Header */}
      <div className={clsx("shrink-0")}>
        {/* Action bar */}
        <BackToListBtn navPath={routes.voucherMgmt} />

        {/* Identity section */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                {/* Code + copy + status */}
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {isSuperadmin && (
                    <>
                      <span
                        className={`font-mono text-xl sm:text-2xl font-bold tracking-wider ${
                          isExpired(voucher?.expireDate)
                            ? "text-red-500"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        {voucher?.code || "—"}
                      </span>
                      <button
                        onClick={handleCopy}
                        title={t("copy_code", { defaultValue: "Copy code" })}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                          copied
                            ? "bg-teal-500/20 text-teal-500"
                            : isDark
                              ? "text-gray-500 hover:text-teal-400 hover:bg-gray-700"
                              : "text-gray-400 hover:text-teal-600 hover:bg-gray-100"
                        }`}
                      >
                        {copied ? (
                          <CheckIcon className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher?.status, isDark)}`}
                  >
                    {getStatusLabel(voucher?.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendEmail}
                    disabled={!voucher?.assigneeInfo?.email}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !voucher?.assigneeInfo?.email
                        ? "opacity-80 cursor-not-allowed bg-blue-500/10 text-blue-400"
                        : isDark
                          ? "bg-blue-500/15 text-blue-400 hover:bg-blue-500 hover:text-white active:scale-95"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white active:scale-95"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{t("send_email")}</span>
                  </button>
                  <button
                    onClick={handleSendSMS}
                    disabled={!voucher?.assigneeInfo?.phone}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !voucher?.assigneeInfo?.phone
                        ? "opacity-80 cursor-not-allowed bg-green-500/10 text-green-600"
                        : isDark
                          ? "bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-white active:scale-95"
                          : "bg-green-100 text-green-700 hover:bg-green-500 hover:text-white active:scale-95"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{t("send_sms")}</span>
                  </button>
                  {voucher?.status === "UNASSIGNED" && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isDark
                          ? "bg-teal-500/15 text-teal-400 hover:bg-teal-500 hover:text-white active:scale-95"
                          : "bg-teal-100 text-teal-700 hover:bg-teal-500 hover:text-white active:scale-95"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">
                        {t("assign_voucher", {
                          defaultValue: "Assign Voucher",
                        })}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Campaign */}
              <p
                className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {voucher?.campId?.name ? voucher.campId?.name : "—"}
              </p>

              {/* Expiry countdown */}
              {voucher?.expireDate &&
                (() => {
                  const daysLeft = Math.ceil(
                    (new Date(voucher.expireDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  );
                  if (daysLeft < 0)
                    return (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t("expired_days_ago", {
                          count: Math.abs(daysLeft),
                          defaultValue: `Expired ${Math.abs(daysLeft)} day(s) ago`,
                        })}
                      </p>
                    );
                  if (daysLeft === 0)
                    return (
                      <p className="text-xs text-orange-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t("expires_today", { defaultValue: "Expires today" })}
                      </p>
                    );
                  return (
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        daysLeft <= 30
                          ? "text-orange-500"
                          : isDark
                            ? "text-gray-400"
                            : "text-gray-500"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {t("expires_in_days", {
                        count: daysLeft,
                        defaultValue: `Expires in ${daysLeft} day(s)`,
                      })}
                    </p>
                  );
                })()}
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 px-3">
        <TabsSection
          tabs={voucherTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {/* Scrollable Content */}
      <div className=" overflow-y-auto min-h-0">
        <div className="py-6 px-2">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <VoucherOverview
              voucher={voucher}
              isDark={isDark}
              isExpired={isExpired}
              isExpiringSoon={isExpiringSoon}
              t={t}
              voucherId={voucherId}
              onSuccess={refetchVoucher}
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
            <VoucherUsageTimeline
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
              t={t}
              isDark={isDark}
              voucher={voucher}
              formatDate={formatDate}
              ordersFromVoucher={ordersFromVoucher}
              isOrderLoading={isOrderLoading}
            />
          )}
        </div>
      </div>
      {showAssignModal && (
        <AssignVoucherModal
          voucherId={voucherId}
          onClose={() => setShowAssignModal(false)}
          onSuccess={refetchVoucher}
        />
      )}
    </div>
  );
}
