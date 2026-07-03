import React from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { useGetPublicSessionTicketQuery } from "@/store/api/sessionQueryApi";

interface IPurchaserInfo {
  name: string;
  email: string;
  phone: string;
}

interface IPublicSessionTicket {
  _id: string;
  wrapperId: string;
  sessionName: string;
  purchaserInfo: IPurchaserInfo;
  sessionImage?: string;
  slotDate: string;
  slotTime: string;
  room?: string;
  status: string;
  bookingReference: string;
  brand?: string;
  headline?: string;
  subhead?: string;
  wrapperImage?: string;
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  BOOKED: {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "bg-blue-100 text-blue-700",
    label: "מוזמן",
  },
  CONFIRMED: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "bg-teal-100 text-teal-700",
    label: "מאושר",
  },
  ATTENDED: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "bg-green-100 text-green-700",
    label: "נכח/ה",
  },
  CANCELLED: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "bg-red-100 text-red-700",
    label: "בוטל",
  },
  NO_SHOW: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: "bg-orange-100 text-orange-700",
    label: "לא הגיע/ה",
  },
  PENDING: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: "bg-yellow-100 text-yellow-700",
    label: "ממתין",
  },
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function PublicSessionPage() {
  const { wrapperId, sessionBookingId } = useParams<{
    wrapperId: string;
    sessionBookingId: string;
  }>();

  const { data, isLoading, isError } = useGetPublicSessionTicketQuery(
    { wrapperId: wrapperId!, sessionBookingId: sessionBookingId! },
    { skip: !wrapperId || !sessionBookingId },
  );
  const session = data as IPublicSessionTicket | undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-700 font-medium">טוען פרטי הזמנה...</p>
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            ההזמנה לא נמצאה
          </h2>
          <p className="text-gray-500 text-sm">הקישור אינו תקין או שפג תוקפו</p>
        </div>
      </div>
    );
  }

  const status =
    statusConfig[session.status?.toUpperCase()] ?? statusConfig["PENDING"];

  const isCancelled = ["CANCELLED", "NO_SHOW"].includes(
    session.status?.toUpperCase(),
  );

  return (
    <div
      className="min-h-screen bg-linear-to-br from-teal-50 via-white to-teal-50"
      dir="rtl"
    >
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Hero banner */}
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-teal-600">
            {session.wrapperImage && (
              <img
                src={session.wrapperImage}
                alt={session.brand}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/10" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
              {session.brand && (
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
                  {session.brand}
                </span>
              )}
              {session.headline && (
                <h1 className="text-white text-xl sm:text-2xl font-bold leading-tight mb-1.5">
                  {session.headline}
                </h1>
              )}
              {session.subhead && (
                <p className="text-white text-xs sm:text-sm">
                  {session.subhead}
                </p>
              )}
            </div>
          </div>

          {isCancelled && (
            <div className="bg-red-600 text-white text-center py-3 px-4 font-bold text-sm tracking-wide">
              {session.status?.toUpperCase() === "CANCELLED"
                ? "ההזמנה בוטלה"
                : "לא הגיע/ה למפגש"}
            </div>
          )}

          {/* Status strip */}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              סטטוס הזמנה
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}
            >
              {status.icon}
              {status.label}
            </span>
          </div>

          <div className="px-5 pt-5 pb-1 flex items-start gap-3">
            {session.sessionImage && (
              <img
                src={session.sessionImage}
                alt={session.sessionName}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                שם המפגש
              </p>
              <p className="text-gray-800 font-semibold text-base">
                {session.sessionName}
              </p>
            </div>
          </div>

          {/* Perforated divider */}
          <div className="relative flex items-center px-4 py-3">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-linear-to-br from-teal-50 via-white to-teal-50 border-r border-gray-100" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-linear-to-br from-teal-50 via-white to-teal-50 border-l border-gray-100" />
          </div>

          <div className="px-5 pb-6 space-y-5">
            {/* Schedule */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                מועד
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>{formatDate(session.slotDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>{session.slotTime}</span>
                </div>
                {session.room && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>{session.room}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Purchaser */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                פרטי הרוכש
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="font-medium">
                    {session.purchaserInfo?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>{session.purchaserInfo?.email}</span>
                </div>
                {session.purchaserInfo?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>{session.purchaserInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Booking reference */}
            <div className="text-center pt-1">
              <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                מספר אסמכתא
              </p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {session.bookingReference}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
