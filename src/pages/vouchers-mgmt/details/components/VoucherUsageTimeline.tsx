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

const VoucherUsageTimeline: React.FC<VoucherUsageTimelineProps> = ({
  timeline,
  getTimelineIcon,
  formatDate,
  t,
  isDark,
}) => {
  return (
    <div
      className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-lg border p-6`}
    >
      <h3
        className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        {t("activity_timeline")}
      </h3>
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Icon + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-100 text-teal-600"}`}
              >
                {getTimelineIcon(event.type)}
              </div>
              {index < timeline.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-2 mb-2 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                  style={{ minHeight: "20px" }}
                />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                {/* Left: description, amount, linked name */}
                <div className="flex-1">
                  <p
                    className={`${isDark ? "text-gray-100" : "text-gray-900"}`}
                  >
                    {event.description}
                  </p>
                  {event.amount !== undefined && (
                    <p
                      className={`text-sm mt-1 ${isDark ? "text-teal-400" : "text-teal-600"}`}
                    >
                      {t("amount")}: ₪{event.amount}
                    </p>
                  )}
                  {event.linkedName && (
                    <a
                      href="#"
                      className={`text-sm mt-1 inline-block hover:underline ${
                        isDark ? "text-teal-400" : "text-teal-600"
                      }`}
                    >
                      → {event.linkedName}
                    </a>
                  )}
                </div>

                {/* Right: date */}
                <span
                  className={`text-xs whitespace-nowrap ml-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  {formatDate(event.date)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherUsageTimeline;
