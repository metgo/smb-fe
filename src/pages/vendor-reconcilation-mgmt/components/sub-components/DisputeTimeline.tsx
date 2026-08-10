import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface TimelineEntry {
  kind: "raised" | "responded" | "reopened";
  createdAt: string;
  performedBy?: { firstName?: string; lastName?: string; email?: string };
  reason?: string;
  description?: string;
  attachments?: string[];
  action?: string;
}

// Merges the original raise, the admin's response (if any), and every
// reopen into a single chronological timeline - oldest first, so it reads
// top-to-bottom the way the dispute actually unfolded. `history` entries
// carry their own `type` ("raised" | "resolved" | "reopened") and can
// duplicate the top-level raisedBy/resolution snapshot for the same event -
// map by type instead of assuming every history entry is a reopen, and skip
// the top-level snapshot whenever history already has an entry of that type
// so nothing is shown twice.
export function useDisputeTimeline(disputeDetails: any): TimelineEntry[] {
  return useMemo(() => {
    if (!disputeDetails) return [];
    const historyEntries: any[] = disputeDetails.history || [];
    const hasRaisedInHistory = historyEntries.some(
      (entry) => entry.type === "raised",
    );
    const hasResolvedInHistory = historyEntries.some(
      (entry) => entry.type === "resolved",
    );

    const entries: TimelineEntry[] = [];

    if (!hasRaisedInHistory) {
      entries.push({
        kind: "raised",
        createdAt: disputeDetails.createdAt,
        performedBy: disputeDetails.raisedBy,
        reason: disputeDetails.reason,
        description: disputeDetails.description,
        attachments: disputeDetails.attachments,
      });
    }

    if (disputeDetails.resolution && !hasResolvedInHistory) {
      entries.push({
        kind: "responded",
        createdAt: disputeDetails.resolution.respondedAt,
        performedBy: disputeDetails.respondedBy,
        description: disputeDetails.resolution.vendorFacingResponse,
        action: disputeDetails.resolution.action,
      });
    }

    historyEntries.forEach((entry) => {
      if (entry.type === "raised") {
        entries.push({
          kind: "raised",
          createdAt: entry.createdAt,
          performedBy: entry.performedBy,
          reason: entry.reason,
          description: entry.description,
          attachments: entry.attachments,
        });
      } else if (entry.type === "resolved") {
        entries.push({
          kind: "responded",
          createdAt: entry.createdAt,
          performedBy: entry.performedBy,
          description: entry.vendorFacingResponse,
          action: entry.action,
        });
      } else if (entry.type === "reopened") {
        entries.push({
          kind: "reopened",
          createdAt: entry.createdAt,
          performedBy: entry.performedBy,
          reason: entry.reason,
          description: entry.description,
          attachments: entry.attachments,
        });
      }
    });

    return entries.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [disputeDetails]);
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface DisputeTimelineProps {
  disputeDetails: any;
  isLoading?: boolean;
}

// Accent colors keyed by isDark instead of Tailwind's `dark:` variant -
// this app toggles light/dark via app state (useThemeClasses/isDark), not
// a `.dark` class on <html>, so `dark:` utilities silently follow the OS
// color scheme instead and can end up illegible (light text on a light
// card) whenever the OS scheme disagrees with the app's own theme.
function getAccent(
  isDark: boolean,
  kind: TimelineEntry["kind"],
  isRejected: boolean,
) {
  if (kind === "responded") {
    return isRejected
      ? {
          line: isDark ? "border-red-700" : "border-red-300",
          dot: "bg-red-500",
          label: isDark ? "text-red-200" : "text-red-800",
          badge: isDark
            ? "bg-red-900/40 text-red-200"
            : "bg-red-100 text-red-800",
          body: isDark ? "text-red-100" : "text-red-900",
          meta: isDark ? "text-red-400" : "text-red-700",
        }
      : {
          line: isDark ? "border-green-700" : "border-green-300",
          dot: "bg-green-500",
          label: isDark ? "text-green-200" : "text-green-800",
          badge: isDark
            ? "bg-green-900/40 text-green-200"
            : "bg-green-100 text-green-800",
          body: isDark ? "text-green-100" : "text-green-900",
          meta: isDark ? "text-green-400" : "text-green-700",
        };
  }
  if (kind === "reopened") {
    return {
      line: isDark ? "border-amber-700" : "border-amber-300",
      dot: "bg-amber-500",
      label: isDark ? "text-amber-200" : "text-amber-800",
      badge: isDark
        ? "bg-amber-900/40 text-amber-200"
        : "bg-amber-100 text-amber-800",
      body: isDark ? "text-amber-100" : "text-amber-900",
      meta: isDark ? "text-amber-400" : "text-amber-700",
    };
  }
  return {
    line: isDark ? "border-orange-700" : "border-orange-300",
    dot: "bg-orange-500",
    label: isDark ? "text-orange-200" : "text-orange-800",
    badge: isDark
      ? "bg-orange-900/40 text-orange-200"
      : "bg-orange-100 text-orange-800",
    body: isDark ? "text-orange-100" : "text-orange-900",
    meta: isDark ? "text-orange-400" : "text-orange-700",
  };
}

export default function DisputeTimeline({
  disputeDetails,
  isLoading,
}: DisputeTimelineProps) {
  const { t } = useTranslation("reconciliation");
  const { isDark } = useThemeClasses();
  const timeline = useDisputeTimeline(disputeDetails);

  const cardClass = isDark
    ? "bg-orange-900/20 border-orange-800"
    : "bg-orange-50 border-orange-200";

  if (isLoading) {
    return (
      <div className={`${cardClass} border rounded-lg p-4`}>
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!disputeDetails) return null;

  return (
    <div className={`${cardClass} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-sm font-semibold ${isDark ? "text-orange-200" : "text-orange-900"}`}
        >
          {t("dispute_information")}
        </h3>
        {disputeDetails.reopenCount > 0 && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isDark
                ? "bg-amber-800/50 text-amber-200"
                : "bg-amber-200/70 text-amber-800"
            }`}
          >
            {t("reopened")} {disputeDetails.reopenCount}x
          </span>
        )}
      </div>

      <div className="space-y-3">
        {timeline.map((entry, idx) => {
          const name = [
            entry.performedBy?.firstName,
            entry.performedBy?.lastName,
          ]
            .filter(Boolean)
            .join(" ");
          const isLast = idx === timeline.length - 1;
          const isRejected =
            entry.kind === "responded" && entry.action !== "accept";
          const accent = getAccent(isDark, entry.kind, isRejected);

          const Icon =
            entry.kind === "reopened"
              ? RotateCcw
              : entry.kind === "responded"
                ? isRejected
                  ? XCircle
                  : CheckCircle2
                : AlertTriangle;

          const label =
            entry.kind === "raised"
              ? t("dispute_raised")
              : entry.kind === "reopened"
                ? t("reopened")
                : isRejected
                  ? t("reject_dispute")
                  : t("approve_dispute");

          return (
            <div
              key={idx}
              className={`relative pl-3 border-l-2 ${accent.line} ${
                isLast ? "" : "pb-3"
              }`}
            >
              <span
                className={`absolute -left-1.25 top-0.5 w-2 h-2 rounded-full ${accent.dot}`}
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${accent.label}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
                <span
                  className={`text-[11px] whitespace-nowrap ${accent.meta}`}
                >
                  {formatDate(entry.createdAt)}
                </span>
              </div>
              <div className={`text-[11px] mt-0.5 ${accent.meta}`}>
                {name || entry.performedBy?.email || "—"}
              </div>
              {entry.reason && (
                <span
                  className={`inline-block mt-1.5 text-[11px] font-medium capitalize px-2 py-0.5 rounded ${accent.badge}`}
                >
                  {entry.reason.replace(/_/g, " ")}
                </span>
              )}
              {entry.description && (
                <p className={`text-xs mt-1.5 ${accent.body}`}>
                  {entry.description}
                </p>
              )}
              {entry.attachments && entry.attachments.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                  {entry.attachments.map((attachment: string, i: number) => (
                    <a
                      key={i}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-[11px] hover:underline ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      <Download className="w-3 h-3" />
                      {t("attachment")} {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
