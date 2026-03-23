import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConnectedWebsites } from "@/components/shared";
import { FileText, AlignLeft, StickyNote, AlertTriangle } from "lucide-react";
import DescriptionCard from "@/components/shared/DescriptionCard";

interface EventInfoDetailsProps {
  t: (key: string) => string;
  eventDetails: any;
}

const EventInfoDetails: React.FC<EventInfoDetailsProps> = ({
  t,
  eventDetails,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="space-y-6">
      <DescriptionCard
        title={t("short_description")}
        content={
          eventDetails?.shortDescription ? eventDetails.shortDescription : "-"
        }
        icon={
          <FileText
            className={clsx(
              "w-5 h-5",
              isDark ? "text-blue-400" : "text-blue-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-blue-500/20" : "bg-blue-100"}
        isDark={isDark}
      />

      <DescriptionCard
        isEvent
        title={t("full_description")}
        content={eventDetails?.description ? eventDetails?.description : "-"}
        icon={
          <AlignLeft
            className={clsx(
              "w-5 h-5",
              isDark ? "text-purple-400" : "text-purple-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-purple-500/20" : "bg-purple-100"}
        isDark={isDark}
        preWrap={true}
      />

      {/* Website Connections */}
      {eventDetails?.associatedWebsites &&
        eventDetails?.associatedWebsites?.length > 0 && (
          <ConnectedWebsites
            t={t}
            associatedWebsites={eventDetails?.associatedWebsites}
          />
        )}

      {/* Internal Notes */}
      {eventDetails?.internalNotes && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark
              ? "bg-yellow-500/10 border-yellow-800/50"
              : "bg-yellow-50 border-yellow-200",
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-yellow-500/20" : "bg-yellow-100",
              )}
            >
              <StickyNote
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-yellow-400" : "text-yellow-600",
                )}
              />
            </div>
            <div className="flex-1">
              <h3
                className={clsx(
                  "text-sm font-semibold uppercase tracking-wide mb-1",
                  isDark ? "text-yellow-400" : "text-yellow-800",
                )}
              >
                {t("internal_notes")}
              </h3>
              <p
                className={clsx(
                  "text-xs",
                  isDark ? "text-yellow-500/70" : "text-yellow-700/70",
                )}
              >
                Private information for internal use only
              </p>
            </div>
          </div>
          <p
            className={clsx(
              "text-base leading-relaxed whitespace-pre-wrap pl-11",
              isDark ? "text-yellow-300" : "text-yellow-900",
            )}
          >
            {eventDetails?.internalNotes}
          </p>
        </div>
      )}

      {/* Rejection Note */}
      {eventDetails?.status === "rejected" && eventDetails?.rejectionNote && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark
              ? "bg-red-500/10 border-red-800/50"
              : "bg-red-50 border-red-200",
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-red-500/20" : "bg-red-100",
              )}
            >
              <AlertTriangle
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-red-400" : "text-red-600",
                )}
              />
            </div>
            <div className="flex-1">
              <h3
                className={clsx(
                  "text-sm font-semibold uppercase tracking-wide mb-1",
                  isDark ? "text-red-400" : "text-red-800",
                )}
              >
                {t("rejection_note")}
              </h3>
              <p
                className={clsx(
                  "text-xs",
                  isDark ? "text-red-500/70" : "text-red-700/70",
                )}
              >
                Reason for event rejection
              </p>
            </div>
          </div>
          <p
            className={clsx(
              "text-base leading-relaxed whitespace-pre-wrap pl-11",
              isDark ? "text-red-300" : "text-red-900",
            )}
          >
            {eventDetails?.rejectionNote || t("no_rejection_note")}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventInfoDetails;
