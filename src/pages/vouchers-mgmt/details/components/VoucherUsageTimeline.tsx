import React from "react";

export interface TimelineEvent {
  id: string | number;
  type: string;
  description: string;
  amount?: number;
  linkedName?: string;
  date: string | Date;
}

interface VoucherUsageTimelineProps {
  timeline: TimelineEvent[];
  getTimelineIcon: (type: string) => React.ReactNode;
  formatDate: (date: string | Date) => string;
  t?: any;
  isDark?: boolean;
}

const iconStylesByType: Record<string, { dark: string; light: string }> = {
  created: {
    dark: "bg-teal-900/40 text-teal-400",
    light: "bg-teal-50 text-teal-600",
  },
  assigned: {
    dark: "bg-violet-900/40 text-violet-400",
    light: "bg-violet-50 text-violet-600",
  },
  sent_email: {
    dark: "bg-blue-900/40 text-blue-400",
    light: "bg-blue-50 text-blue-600",
  },
  sent_sms: {
    dark: "bg-green-900/40 text-green-400",
    light: "bg-green-50 text-green-600",
  },
  product_purchased: {
    dark: "bg-amber-900/40 text-amber-400",
    light: "bg-amber-50 text-amber-600",
  },
  trip_used: {
    dark: "bg-sky-900/40 text-sky-400",
    light: "bg-sky-50 text-sky-600",
  },
  fun_day_used: {
    dark: "bg-pink-900/40 text-pink-400",
    light: "bg-pink-50 text-pink-600",
  },
  partial_redemption: {
    dark: "bg-yellow-900/40 text-yellow-400",
    light: "bg-yellow-50 text-yellow-600",
  },
  refund: {
    dark: "bg-red-900/40 text-red-400",
    light: "bg-red-50 text-red-600",
  },
  expiration_extended: {
    dark: "bg-teal-900/40 text-teal-400",
    light: "bg-teal-50 text-teal-600",
  },
};

const VoucherUsageTimeline: React.FC<VoucherUsageTimelineProps> = ({
  timeline,
  getTimelineIcon,
  formatDate,
  t,
  isDark,
}) => {
  const validEvents = timeline.filter((e) => e.date);

  return (
    <div
      className={`rounded-xl border p-5 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
    >
      <h3
        className={`text-sm font-semibold mb-5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {t("activity_timeline")}
      </h3>

      {validEvents.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-gray-800 text-gray-600" : "bg-gray-100 text-gray-300"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {t("no_timeline_events", { defaultValue: "No activity yet" })}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {validEvents.map((event, index) => {
            const styles = iconStylesByType[event.type] ?? {
              dark: "bg-gray-800 text-gray-400",
              light: "bg-gray-100 text-gray-500",
            };
            return (
              <div key={event.id} className="flex gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDark ? styles.dark : styles.light}`}
                  >
                    {getTimelineIcon(event.type)}
                  </div>
                  {index < validEvents.length - 1 && (
                    <div
                      className={`w-px flex-1 mt-1 mb-1 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                      style={{ minHeight: "16px" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${isDark ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {event.description}
                      </p>
                      {event.amount !== undefined && (
                        <p
                          className={`text-xs mt-1 font-medium ${isDark ? "text-teal-400" : "text-teal-600"}`}
                        >
                          {t("amount")}: ₪{event.amount}
                        </p>
                      )}
                      {event.linkedName && (
                        <a
                          href="#"
                          className={`text-xs mt-1 inline-block hover:underline ${isDark ? "text-teal-400" : "text-teal-600"}`}
                        >
                          → {event.linkedName}
                        </a>
                      )}
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap shrink-0 pt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VoucherUsageTimeline;
