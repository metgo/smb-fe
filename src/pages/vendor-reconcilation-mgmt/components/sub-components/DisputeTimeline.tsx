import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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

export default function DisputeTimeline({
  disputeDetails,
  isLoading,
}: DisputeTimelineProps) {
  const { t } = useTranslation("reconciliation");
  const timeline = useDisputeTimeline(disputeDetails);

  if (isLoading) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!disputeDetails) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200">
          {t("dispute_information")}
        </h3>
        {disputeDetails.reopenCount > 0 && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200">
            {t("reopened")} {disputeDetails.reopenCount}x
          </span>
        )}
      </div>

      <div className="space-y-3">
        {timeline.map((entry, idx) => {
          const name = [entry.performedBy?.firstName, entry.performedBy?.lastName]
            .filter(Boolean)
            .join(" ");
          const isLast = idx === timeline.length - 1;
          const isRejected =
            entry.kind === "responded" && entry.action !== "accept";

          const accent =
            entry.kind === "responded"
              ? isRejected
                ? {
                    line: "border-red-300 dark:border-red-700",
                    dot: "bg-red-500",
                    label: "text-red-800 dark:text-red-200",
                    badge:
                      "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
                    body: "text-red-900 dark:text-red-100",
                    meta: "text-red-700 dark:text-red-400",
                  }
                : {
                    line: "border-green-300 dark:border-green-700",
                    dot: "bg-green-500",
                    label: "text-green-800 dark:text-green-200",
                    badge:
                      "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
                    body: "text-green-900 dark:text-green-100",
                    meta: "text-green-700 dark:text-green-400",
                  }
              : entry.kind === "reopened"
                ? {
                    line: "border-amber-300 dark:border-amber-700",
                    dot: "bg-amber-500",
                    label: "text-amber-800 dark:text-amber-200",
                    badge:
                      "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
                    body: "text-amber-900 dark:text-amber-100",
                    meta: "text-amber-700 dark:text-amber-400",
                  }
                : {
                    line: "border-orange-300 dark:border-orange-700",
                    dot: "bg-orange-500",
                    label: "text-orange-800 dark:text-orange-200",
                    badge:
                      "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200",
                    body: "text-orange-900 dark:text-orange-100",
                    meta: "text-orange-700 dark:text-orange-400",
                  };

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
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
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
