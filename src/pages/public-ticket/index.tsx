import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ticket,
} from "lucide-react";

import { toast } from "sonner";

import { useGetPublicEventTicketQuery } from "@/store/api/eventQueryApi";
import { useUpdateEventTicketStatusMutation } from "@/store/api/eventMutationApi";

interface TicketDay {
  date: string;
  startTime: string;
  endTime: string;
}

interface IPublicTicket {
  _id: string;
  ticketName: string;
  ticketDescription: string;
  ticketImages: { image: string }[];
  ticketType: string;
  ticketPrice: {
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number;
  };
  ticketDayDescription: TicketDay[];
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  paymentStatus: string;
  paymentMode: string[];
  paymentDate: string | null;
  status: string;
  quantity: number;
  amount: number;
  eventId: string;
  eventName: string;
  eventImages: { image: string; isPrimary: boolean }[];
  eventShortDescription: string;
  eventDayDescription: TicketDay[];
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; color: string; labelKey: string }
> = {
  SUCCESS: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-green-600",
    labelKey: "payment_successful",
  },
  FAILED: {
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-600",
    labelKey: "payment_failed_label",
  },
  PENDING: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: "text-yellow-600",
    labelKey: "payment_pending_label",
  },
};

const orderStatusConfig: Record<string, { color: string; labelKey: string }> = {
  completed: { color: "bg-green-500 text-white", labelKey: "completed" },
  canceled: { color: "bg-red-500 text-white", labelKey: "canceled" },
  pending: { color: "bg-yellow-500 text-white", labelKey: "purchased" },
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PublicTicketPage() {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT("he", "events");
  const { eventId, ticketId } = useParams<{
    eventId: string;
    ticketId: string;
  }>();

  const { data, isLoading, isError, refetch } = useGetPublicEventTicketQuery(
    { eventId: eventId!, ticketId: ticketId! },
    { skip: !eventId || !ticketId },
  );
  const ticket = data as IPublicTicket | undefined;

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateEventTicketStatusMutation();

  const handleMarkCompleted = async () => {
    if (!ticket) return;
    try {
      await updateStatus({
        orderId: ticket._id,
        status: "completed",
      }).unwrap();
      toast.success(t("order_status_updated", { status: t("completed") }));
      refetch();
    } catch {
      toast.error(t("failed_to_update_order_status"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-700 font-medium">
            {t("public_ticket_loading")}
          </p>
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t("ticket_not_found")}
          </h2>
          <p className="text-gray-500 text-sm">{t("ticket_invalid_link")}</p>
        </div>
      </div>
    );
  }

  const coverImage =
    ticket.eventImages.find((img) => img.isPrimary)?.image ||
    ticket.eventImages[0]?.image;

  const paymentStatus =
    statusConfig[ticket.paymentStatus?.toUpperCase()] ??
    statusConfig["PENDING"];

  const orderStatus = orderStatusConfig[ticket.status?.toLowerCase()] ?? {
    color: "bg-gray-500 text-white",
    labelKey: ticket.status,
  };

  const fullName = `${ticket.firstName} ${ticket.lastName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-teal-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-teal-600 font-bold text-lg">
            <Ticket className="w-5 h-5" />
            {t("event_ticket_header")}
          </div>
        </div>

        {/* Ticket card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Event cover image */}
          {coverImage && (
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={coverImage}
                alt={ticket.eventName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h1 className="text-white text-xl font-bold leading-tight">
                  {ticket.eventName}
                </h1>
                {ticket.eventShortDescription && (
                  <p className="text-white/80 text-xs mt-1 line-clamp-2">
                    {ticket.eventShortDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No image fallback header */}
          {!coverImage && (
            <div className="bg-linear-to-r from-teal-600 to-teal-400 p-6">
              <h1 className="text-white text-xl font-bold">
                {ticket.eventName}
              </h1>
              {ticket.eventShortDescription && (
                <p className="text-white/80 text-sm mt-1">
                  {ticket.eventShortDescription}
                </p>
              )}
            </div>
          )}

          {/* Status strip */}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
            <div
              className={`flex items-center gap-1.5 text-sm font-medium ${paymentStatus.color}`}
            >
              {paymentStatus.icon}
              {t(paymentStatus.labelKey)}
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${orderStatus.color}`}
            >
              {t(orderStatus.labelKey, { defaultValue: orderStatus.labelKey })}
            </span>
          </div>

          {/* Ticket perforated divider */}
          <div className="relative flex items-center px-4 py-2">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-linear-to-br from-teal-50 via-white to-teal-50 border-r border-gray-100" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-linear-to-br from-teal-50 via-white to-teal-50 border-l border-gray-100" />
          </div>

          <div className="px-5 pb-6 space-y-5">
            {/* Ticket name + type */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                  {t("ticket_name")}
                </p>
                <p className="text-gray-800 font-semibold text-base">
                  {ticket.ticketName}
                </p>
                {ticket.ticketDescription && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {ticket.ticketDescription}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 capitalize">
                  {ticket.ticketType}
                </span>
                <p className="text-gray-400 text-xs mt-1">
                  {t("quantity")}: {ticket.quantity}
                </p>
              </div>
            </div>

            {/* Event dates */}
            {ticket.eventDayDescription?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                  {t("event_schedule")}
                </p>
                <div className="space-y-1.5">
                  {ticket.eventDayDescription.map((day, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Calendar className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>{formatDate(day.date)}</span>
                      <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0 ml-1" />
                      <span>
                        {day.startTime} – {day.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendee */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                {t("attendee")}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="font-medium">{fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>{ticket.email}</span>
                </div>
                {ticket.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>{ticket.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                {t("payment")}
              </p>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-teal-500" />
                    {t("method")}
                  </span>
                  <span className="text-gray-700 font-medium capitalize">
                    {ticket.paymentMode?.join(", ") || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t("amount")}</span>
                  <span className="text-gray-800 font-semibold">
                    ₪{ticket.amount}
                  </span>
                </div>
                {ticket.paymentDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t("date")}</span>
                    <span className="text-gray-600">
                      {formatDateTime(ticket.paymentDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket ID */}
            <div className="text-center pt-1">
              <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                {t("ticket_id_label")}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {ticket._id}
              </p>
            </div>

            {/* Mark as Completed */}
            <button
              onClick={handleMarkCompleted}
              disabled={
                ticket.status?.toLowerCase() === "completed" || isUpdating
              }
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isUpdating
                ? t("updating")
                : ticket.status?.toLowerCase() === "completed"
                  ? t("completed_checkmark")
                  : t("mark_as_completed")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
