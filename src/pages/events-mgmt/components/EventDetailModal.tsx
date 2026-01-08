import React from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import {
  X,
  Calendar,
  CalendarRange,
  MapPin,
  Clock,
  DollarSign,
  FileDown,
  Search,
  ArrowUpDown,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


interface EventDetailModalProps {
  selectedEvent: Event | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<Event | null>>;

  // Daily breakdown toggle
  showDailyBreakdown: boolean;
  setShowDailyBreakdown: React.Dispatch<React.SetStateAction<boolean>>;

  // Registrants search & sorting
  registrantSearchQuery: string;
  setRegistrantSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredRegistrants: Registrant[];
  handleSort: (key: string) => void;

  // Export
  exportToCSV: () => void;

  // RTL
  isRTL: boolean;

  // Optional: Selected registrant for further detail
  setSelectedRegistrant?: React.Dispatch<React.SetStateAction<Registrant | null>>;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  selectedEvent,
  setSelectedEvent,
  showDailyBreakdown,
  setShowDailyBreakdown,
  registrantSearchQuery,
  setRegistrantSearchQuery,
  filteredRegistrants,
  handleSort,
  exportToCSV,
  isRTL,
  setSelectedRegistrant,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textSecondary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  if (!selectedEvent) return null;

  const formatDateRange = (start: string, end?: string, isMultiDay?: boolean) => {
    if (!isMultiDay || !end) {
      return new Date(start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const startFormatted = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFormatted = new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startFormatted} - ${endFormatted}`;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "refunded":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedEvent(null);
      }}
    >
      <div
        className={`w-full max-w-6xl my-8 rounded-2xl shadow-2xl ${theme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-8 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className={`text-3xl font-bold ${textPrimary}`}>
                  {selectedEvent.name}
                </h2>
                {selectedEvent.isMultiDay && (
                  <span className="px-4 py-2 bg-teal-500/20 text-teal-500 rounded-full text-sm font-medium flex items-center gap-2">
                    <CalendarRange className="w-4 h-4" />
                    {t("multi_day_event")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6 text-base">
                <span className={`flex items-center gap-2 ${textSecondary}`}>
                  <MapPin className="w-5 h-5" />
                  {selectedEvent.location}
                </span>
                <span className={`flex items-center gap-2 ${textSecondary}`}>
                  <Calendar className="w-5 h-5" />
                  {formatDateRange(
                    selectedEvent.startDate,
                    selectedEvent.endDate,
                    selectedEvent.isMultiDay
                  )}
                </span>
                <span className={`flex items-center gap-2 ${textSecondary}`}>
                  <Clock className="w-5 h-5" />
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </span>
                <span className={`flex items-center gap-2 ${textSecondary}`}>
                  <DollarSign className="w-5 h-5" />
                  {selectedEvent.isFree ? t("free") : `₪${selectedEvent.price}`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className={`p-3 rounded-xl transition-all ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
            >
              <X className={`w-6 h-6 ${textTertiary}`} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[75vh] overflow-y-auto">
          {/* Metrics Snapshot */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-semibold ${textPrimary}`}>
                {t("event_metrics")}
              </h3>
              {selectedEvent.isMultiDay && selectedEvent.dailyMetrics && (
                <button
                  onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                >
                  {showDailyBreakdown ? t("show_summary") : t("show_daily_breakdown")}
                </button>
              )}
            </div>

            {!showDailyBreakdown ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  { label: t("total_registrations"), value: selectedEvent.totalRegistrations },
                  {
                    label: t("capacity"),
                    value: selectedEvent.capacity,
                    sub: `${Math.round(
                      (selectedEvent.totalRegistrations / selectedEvent.capacity) * 100
                    )}% ${t("filled")}`,
                  },
                  { label: t("revenue"), value: `₪${(selectedEvent.revenue / 1000).toFixed(1)}K` },
                  { label: t("refunds"), value: `₪${(selectedEvent.refunds / 1000).toFixed(1)}K` },
                  {
                    label: t("event_type"),
                    value: selectedEvent.isFree ? t("free") : t("paid"),
                  },
                ].map((metric, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-2xl ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-50"
                      }`}
                  >
                    <div className={`text-sm mb-2 ${textTertiary}`}>{metric.label}</div>
                    <div className={`text-3xl font-bold ${textPrimary}`}>{metric.value}</div>
                    {metric.sub && <div className="text-sm text-teal-500 mt-2">{metric.sub}</div>}
                  </div>
                ))}
              </div>
            ) : (
              selectedEvent.dailyMetrics && (
                <div className="space-y-6">
                  <h4 className={`text-lg font-medium mb-4 ${textSecondary}`}>
                    {t("daily_breakdown")}
                  </h4>
                  {selectedEvent.dailyMetrics.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl border ${theme === "dark"
                          ? "border-gray-700 bg-gray-800/30"
                          : "border-gray-200 bg-gray-50"
                        }`}
                    >
                      <div className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <div className={`text-sm ${textTertiary}`}>{t("registrations")}</div>
                          <div className={`text-2xl font-bold ${textPrimary}`}>
                            {day.registrations}
                          </div>
                        </div>
                        <div>
                          <div className={`text-sm ${textTertiary}`}>{t("attendance")}</div>
                          <div className={`text-2xl font-bold ${textPrimary}`}>
                            {day.attendance}
                          </div>
                        </div>
                        <div>
                          <div className={`text-sm ${textTertiary}`}>{t("revenue")}</div>
                          <div className={`text-2xl font-bold ${textPrimary}`}>
                            ₪{(day.revenue / 1000).toFixed(1)}K
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Trend Chart */}
            {selectedEvent.dailyMetrics && selectedEvent.dailyMetrics.length > 1 && (
              <div className={`mt-8 p-6 rounded-2xl ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-50"}`}>
                <h4 className={`text-lg font-medium mb-4 ${textSecondary}`}>
                  {t("registration_attendance_trend")}
                </h4>
                <div style={{ height: "280px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedEvent.dailyMetrics}>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                          border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#14b8a6"
                        strokeWidth={3}
                        dot={{ fill: "#14b8a6", r: 6 }}
                        name={t("registrations")}
                      />
                      <Line
                        type="monotone"
                        dataKey=" tickAttendance"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", r: 6 }}
                        name={t("attendance")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>

          {/* Registrants Table */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-semibold ${textPrimary}`}>
                {t("registrants")} ({filteredRegistrants.length})
              </h3>
              <button
                onClick={exportToCSV}
                className={`px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
              >
                <FileDown className="w-5 h-5" />
                {t("export_csv")}
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search
                className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 ${textTertiary}`}
              />
              <input
                type="text"
                placeholder={t("search_registrants_placeholder")}
                value={registrantSearchQuery}
                onChange={(e) => setRegistrantSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 rounded-xl border text-base ${theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  } focus:ring-2 focus:ring-teal-500/20 transition-all`}
              />
            </div>

            {filteredRegistrants.length === 0 ? (
              <div className="text-center py-16">
                <Users className={`w-20 h-20 mx-auto mb-5 opacity-50 ${textTertiary}`} />
                <p className={`text-lg ${textTertiary}`}>
                  {registrantSearchQuery ? t("no_registrants_match") : t("no_registrants_yet")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left">
                  <thead className={`border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
                    <tr>
                      <th
                        className={`py-4 px-6 text-sm font-medium ${textTertiary} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                        onClick={() => handleSort("fullName")}
                      >
                        <div className="flex items-center gap-2">
                          {t("full_name")}
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className={`py-4 px-6 text-sm font-medium ${textTertiary} hidden md:table-cell`}>
                        {t("phone")}
                      </th>
                      <th className={`py-4 px-6 text-sm font-medium ${textTertiary} hidden lg:table-cell`}>
                        {t("email")}
                      </th>
                      <th className={`py-4 px-6 text-sm font-medium text-right ${textTertiary}`}>
                        {t("quantity")}
                      </th>
                      <th className={`py-4 px-6 text-sm font-medium ${textTertiary} hidden xl:table-cell`}>
                        {t("ticket_type")}
                      </th>
                      <th
                        className={`py-4 px-6 text-sm font-medium text-right ${textTertiary} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                        onClick={() => handleSort("totalPrice")}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {t("total")}
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className={`py-4 px-6 text-sm font-medium text-center ${textTertiary}`}>
                        {t("status")}
                      </th>
                      <th className={`py-4 px-6 text-sm font-medium ${textTertiary} hidden lg:table-cell`}>
                        {t("registration_date")}
                      </th>
                      {selectedEvent.isMultiDay && (
                        <th className={`py-4 px-6 text-sm font-medium ${textTertiary} hidden xl:table-cell`}>
                          {t("days")}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrants.map((reg) => (
                      <tr
                        key={reg.id}
                        onClick={() => setSelectedRegistrant?.(reg)}
                        className={`border-b transition-colors cursor-pointer ${theme === "dark"
                            ? "border-gray-800 hover:bg-gray-800/50"
                            : "border-gray-100 hover:bg-gray-50"
                          }`}
                      >
                        <td className={`py-4 px-6 ${textPrimary}`}>{reg.fullName}</td>
                        <td className={`py-4 px-6 ${textSecondary} hidden md:table-cell`}>
                          {reg.phone}
                        </td>
                        <td className={`py-4 px-6 ${textSecondary} hidden lg:table-cell`}>
                          {reg.email}
                        </td>
                        <td className={`py-4 px-6 text-right ${textPrimary}`}>{reg.quantity}</td>
                        <td className={`py-4 px-6 ${textSecondary} hidden xl:table-cell`}>
                          {reg.ticketType}
                        </td>
                        <td className={`py-4 px-6 text-right font-medium ${textPrimary}`}>
                          ₪{reg.totalPrice}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              reg.paymentStatus
                            )}`}
                          >
                            {reg.paymentStatus === "paid"
                              ? t("paid_status")
                              : reg.paymentStatus === "pending"
                                ? t("pending_status")
                                : t("refunded_status")}
                          </span>
                        </td>
                        <td className={`py-4 px-6 ${textSecondary} hidden lg:table-cell`}>
                          {new Date(reg.registrationDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        {selectedEvent.isMultiDay && reg.attendingDays && (
                          <td className={`py-4 px-6 ${textSecondary} hidden xl:table-cell`}>
                            {reg.attendingDays.length} {t("days")}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;