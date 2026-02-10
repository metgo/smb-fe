import { useThemeClasses } from "@/hooks/useThemeClasses";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

type EventStatus = "draft" | "pending" | "approved" | "rejected" | "archived";

interface EventTitleSectionProps {
  name: string;
  status: EventStatus;
  impact: number;
}
const EventTitleSection = ({
  name,
  status,
  impact,
}: EventTitleSectionProps) => {
  const { t } = useTranslation("event");
  const { t: tc } = useTranslation("common");

  const { isDark } = useThemeClasses();

  const StatusBadge = ({ status }: { status: EventStatus }) => {
    const statusConfig: Record<EventStatus, { color: string; label: string }> =
      {
        draft: { color: "bg-gray-500", label: t("draft") },
        pending: { color: "bg-yellow-500", label: t("pending") },
        approved: { color: "bg-green-500", label: t("approved") },
        rejected: { color: "bg-red-500", label: t("rejected") },
        archived: { color: "bg-gray-400", label: t("archived") },
      };
    const config = statusConfig[status];
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm text-white capitalize ${config?.color}`}
      >
        {config?.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1
          className={`text-3xl mb-2 ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          {name}
        </h1>
        <div className="flex items-center gap-4">
          <StatusBadge status={status?.toLowerCase() as EventStatus} />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
              {tc("impact_score")}: {impact ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Percentage */}
      {/* <div className="flex flex-col items-end">
        <span
          className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("completion_percentage")}
        </span>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${business.completionPercentage}%` }}
            />
          </div>
          <span
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {business.completionPercentage}%
          </span>
        </div>
      </div> */}
    </div>
  );
};
export default EventTitleSection;
