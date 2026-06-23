import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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

import { envKeys } from "@/lib/envKeys";
import { endpoints } from "@/lib/endpoints";

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
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  SUCCESS: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    label: "Payment Successful",
  },
  FAILED: {
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    label: "Payment Failed",
  },
  PENDING: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    label: "Payment Pending",
  },
};

const orderStatusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: "bg-green-500 text-white", label: "Completed" },
  canceled: { color: "bg-red-500 text-white", label: "Cancelled" },
  pending: { color: "bg-yellow-500 text-white", label: "Pending" },
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
  const { eventId, ticketId } = useParams<{
    eventId: string;
    ticketId: string;
  }>();

  const [ticket, setTicket] = useState<IPublicTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !ticketId) {
      setError("Invalid ticket link.");
      setLoading(false);
      return;
    }

    axios
      .get(
        `${envKeys.baseUrl}${endpoints.publicEventTicket}/${eventId}/${ticketId}`,
      )
      .then((res) => setTicket(res.data))
      .catch(() => setError("Ticket not found or the link is invalid."))
      .finally(() => setLoading(false));
  }, [eventId, ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-700 font-medium">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-500 text-sm">{error}</p>
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
    label: ticket.status,
  };

  const fullName = `${ticket.firstName} ${ticket.lastName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-teal-600 font-bold text-lg">
            <Ticket className="w-5 h-5" />
            Event Ticket
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
            <div className="bg-gradient-to-r from-teal-600 to-teal-400 p-6">
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
              {paymentStatus.label}
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${orderStatus.color}`}
            >
              {orderStatus.label}
            </span>
          </div>

          {/* Ticket perforated divider */}
          <div className="relative flex items-center px-4 py-2">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-teal-50 via-white to-teal-50 border-r border-gray-100" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-teal-50 via-white to-teal-50 border-l border-gray-100" />
          </div>

          <div className="px-5 pb-6 space-y-5">
            {/* Ticket name + type */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                  Ticket
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
                  Qty: {ticket.quantity}
                </p>
              </div>
            </div>

            {/* Event dates */}
            {ticket.eventDayDescription?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                  Event Schedule
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
                Attendee
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
                Payment
              </p>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-teal-500" />
                    Method
                  </span>
                  <span className="text-gray-700 font-medium capitalize">
                    {ticket.paymentMode?.join(", ") || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-gray-800 font-semibold">
                    ₪{ticket.amount}
                  </span>
                </div>
                {ticket.paymentDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Date</span>
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
                Ticket ID
              </p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {ticket._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
