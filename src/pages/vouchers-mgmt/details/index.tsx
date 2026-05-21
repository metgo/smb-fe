import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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
} from "lucide-react";
import { routes } from "@/lib/routes";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetVoucherByIdQuery } from "@/store/api/voucherQueryApi";
import { BackToListBtn } from "@/components/btns";
import { formatDate, getStatusColor, getStatusLabel } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Spinner, TabsSection } from "@/components/shared";

import { useGetAllOrdersQuery } from "@/store/api/orderQueryApi";
import {
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
  const { isDark, borderColor } = useThemeClasses();

  const [voucherId, setVoucherId] = useState("");
  const [activeTab, setActiveTab] = useState<string>("overview");

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
      <div className={clsx(` shrink-0 border-b py-4 `, borderColor)}>
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <BackToListBtn navPath={routes.voucherMgmt} />
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
      </div>
      <div className="shrink-0">
        <TabsSection
          tabs={voucherTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className=" py-6">
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
    </div>
  );
}
