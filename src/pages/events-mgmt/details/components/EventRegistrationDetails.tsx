import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Search, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ReordableDataTable } from "@/components/shared";
import { ExportBtns } from "@/components/btns";
import { useAppSelector } from "@/hooks/hooks";

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

interface EventRegistrationDetailsProps {
  eventDetails: any;
  registrantSearchQuery: string;
  setRegistrantSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const EventRegistrationDetails: React.FC<EventRegistrationDetailsProps> = ({
  eventDetails,
  registrantSearchQuery,
  setRegistrantSearchQuery,
}) => {
  const filteredRegistrants: any[] = [];
  const { t } = useTranslation("events");
  const { isRTL } = useAppSelector((state) => state.settings);
  const { textPrimary, textSecondary, textTertiary, isDark } =
    useThemeClasses();

  const [showDailyBreakdown, setShowDailyBreakdown] = useState(true);
  const [_selectedRegistrant, setSelectedRegistrant] = useState([]);

  if (!eventDetails) return null;

  const exportToCSV = () => {
    if (!eventDetails) return;
    const headers = [
      t("full_name"),
      t("phone"),
      t("email"),
      t("quantity"),
      t("ticket_type"),
      `${t("total")} ${t("price")}`,
      t("payment_status"),
      t("registration_date"),
      t("source_website"),
    ];
    const rows = filteredRegistrants.map((reg) => [
      reg.fullName,
      reg.phone,
      reg.email,
      reg.quantity,
      reg.ticketType,
      `₪${reg.totalPrice}`,
      reg.paymentStatus,
      reg.registrationDate,
      reg.sourceWebsite,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventDetails?.name.replace(/\s+/g, "_")}_registrants.csv`;
    a.click();
  };

  const exportToPDF = () => {
    if (!eventDetails) return;

    // Create a simple HTML document for PDF printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${eventDetails?.name} - ${t("registrants")}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #14b8a6; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${eventDetails?.name}</h1>
          <p><strong>${t("total_registrations")}:</strong> ${filteredRegistrants.length}</p>
          <table>
            <thead>
              <tr>
                <th>${t("full_name")}</th>
                <th>${t("phone")}</th>
                <th>${t("email")}</th>
                <th>${t("quantity")}</th>
                <th>${t("ticket_type")}</th>
                <th>${t("total")}</th>
                <th>${t("payment_status")}</th>
                <th>${t("reg_date")}</th>
                <th>${t("source_website")}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRegistrants
                .map(
                  (reg) => `
                <tr>
                  <td>${reg.fullName}</td>
                  <td>${reg.phone}</td>
                  <td>${reg.email}</td>
                  <td>${reg.quantity}</td>
                  <td>${reg.ticketType}</td>
                  <td>₪${reg.totalPrice}</td>
                  <td>${reg.paymentStatus}</td>
                  <td>${reg.registrationDate}</td>
                  <td>${reg.sourceWebsite}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-8 max-h-[75vh] overflow-y-auto">
      {/* Metrics Snapshot */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          {eventDetails?.isMultiDay && eventDetails?.dailyMetrics && (
            <button
              onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {showDailyBreakdown
                ? t("show_summary")
                : t("show_daily_breakdown")}
            </button>
          )}
        </div>

        {eventDetails?.dailyMetrics && (
          <div className="space-y-6">
            <h4 className={`text-lg font-medium mb-4 ${textSecondary}`}>
              {t("daily_breakdown")}
            </h4>
            {eventDetails?.dailyMetrics.map((day: any, idx: number) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${
                  isDark
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
                    <div className={`text-sm ${textTertiary}`}>
                      {t("registrations")}
                    </div>
                    <div className={`text-2xl font-bold ${textPrimary}`}>
                      {day.registrations}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${textTertiary}`}>
                      {t("attendance")}
                    </div>
                    <div className={`text-2xl font-bold ${textPrimary}`}>
                      {day.attendance}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${textTertiary}`}>
                      {t("revenue")}
                    </div>
                    <div className={`text-2xl font-bold ${textPrimary}`}>
                      ₪{(day.revenue / 1000).toFixed(1)}K
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trend Chart */}
        {eventDetails?.dailyMetrics &&
          eventDetails?.dailyMetrics.length > 1 && (
            <div
              className={`mt-8 p-6 rounded-2xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}
            >
              <h4 className={`text-lg font-medium mb-4 ${textSecondary}`}>
                {t("registration_attendance_trend")}
              </h4>
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventDetails?.dailyMetrics}>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke={isDark ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={isDark ? "#9ca3af" : "#6b7280"}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis stroke={isDark ? "#9ca3af" : "#6b7280"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
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
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-2xl font-semibold ${textPrimary}`}>
            {t("registrants")} ({filteredRegistrants.length})
          </h3>
          <ExportBtns exportToCSV={exportToCSV} exportToPDF={exportToPDF} />
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
            className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 rounded-xl border text-base ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            } focus:ring-2 focus:ring-teal-500/20 transition-all`}
          />
        </div>

        {filteredRegistrants?.length === 0 ? (
          <div className="text-center py-16">
            <Users
              className={`w-20 h-20 mx-auto mb-5 opacity-50 ${textTertiary}`}
            />
            <p className={`text-lg ${textTertiary}`}>
              {registrantSearchQuery
                ? t("no_registrants_match")
                : t("no_registrants_yet")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <ReordableDataTable
              rowKey="id"
              data={filteredRegistrants}
              onRowClick={(item) => setSelectedRegistrant?.(item)}
              storageKey="registrantsTableColumnOrder"
              columns={[
                {
                  key: "full_name",
                  label: t("full_name"),
                  sortable: true,
                  render: (reg) => (
                    <span className="text-sm font-medium">{reg.fullName}</span>
                  ),
                },
                {
                  key: "phone",
                  label: t("phone"),
                  render: (reg) => (
                    <span className="text-sm text-gray-500">
                      {reg.phone || "-"}
                    </span>
                  ),
                },
                {
                  key: "email",
                  label: t("email"),
                  render: (reg) => (
                    <span className="text-sm text-gray-500">
                      {reg.email || "-"}
                    </span>
                  ),
                },
                {
                  key: "quantity",
                  label: t("quantity"),
                  sortable: true,
                  render: (reg) => (
                    <div className="text-right text-sm font-medium">
                      {reg.quantity}
                    </div>
                  ),
                },
                {
                  key: "ticket_type",
                  label: t("ticket_type"),
                  render: (reg) => (
                    <span className="text-sm text-gray-500">
                      {reg.ticketType || "-"}
                    </span>
                  ),
                },
                {
                  key: "total",
                  label: t("total"),
                  sortable: true,
                  render: (reg) => (
                    <div className="text-right font-medium">
                      ₪{reg.totalPrice}
                    </div>
                  ),
                },
                {
                  key: "status",
                  label: t("status"),
                  render: (reg) => (
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        reg.paymentStatus,
                      )}`}
                    >
                      {reg.paymentStatus === "paid"
                        ? t("paid")
                        : reg.paymentStatus === "pending"
                          ? t("pending")
                          : t("refunded")}
                    </span>
                  ),
                },
                {
                  key: "registration_date",
                  label: t("registration_date"),
                  sortable: true,
                  render: (reg) =>
                    new Date(reg.registrationDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                },
                ...(eventDetails?.isMultiDay
                  ? [
                      {
                        key: "days",
                        label: t("days"),
                        render: (reg: any) =>
                          reg.attendingDays ? (
                            <span className="text-sm text-gray-500">
                              {reg.attendingDays.length} {t("days")}
                            </span>
                          ) : (
                            "-"
                          ),
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default EventRegistrationDetails;
