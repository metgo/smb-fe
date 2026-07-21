import clsx from "clsx";
import {
  FileText,
  AlignLeft,
  StickyNote,
  AlertTriangle,
  BriefcaseBusinessIcon,
} from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";
import DmoAuthDetails from "@/components/details-sections/DmoAuthDetails";
import { useTranslation } from "react-i18next";

interface EventInfoDetailsProps {
  t: (key: string) => string;
  eventDetails: any;
}

const EventInfoDetails: React.FC<EventInfoDetailsProps> = ({
  t,
  eventDetails,
}) => {
  const { isDark, language } = useThemeClasses();
  const { t: tp } = useTranslation("products");

  return (
    <div className="space-y-6">
      <DescriptionCard
        title={t("short_description")}
        content={getLngWiseStr(
          language,
          eventDetails?.shortDescription,
          eventDetails?.shortDescriptionHe,
          eventDetails?.shortDescriptionAr,
        )}
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
        content={getLngWiseStr(
          language,
          eventDetails?.description,
          eventDetails?.descriptionHe,
          eventDetails?.descriptionAr,
        )}
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
      <DescriptionCard
        title={tp("business_name")}
        content={
          eventDetails?.businessId?.name ? eventDetails?.businessId?.name : "-"
        }
        icon={
          <BriefcaseBusinessIcon
            className={clsx(
              "w-5 h-5",
              isDark ? "text-purple-400" : "text-purple-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-purple-500/20" : "bg-purple-100"}
        isDark={isDark}
        preWrap={true} // preserves line breaks
      />

      <DmoAuthDetails
        dmoId={eventDetails?.dmoId}
        authorityId={eventDetails?.authorityId}
        associatedWebsiteIds={eventDetails?.associatedWebsiteIds}
      />

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
