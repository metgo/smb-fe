import { toast } from "sonner";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import {
  ExternalLink,
  FileText,
  AlignLeft,
  Globe,
  StickyNote,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

interface EventInfoDetailsProps {
  t: (key: string) => string;
  eventDetails: any;
}

const EventInfoDetails: React.FC<EventInfoDetailsProps> = ({
  t,
  eventDetails,
}) => {
  const { isDark } = useThemeClasses();

  const handleWebsiteClick = (website: any) => {
    if (website.url) {
      window.open(website.url, "_blank");
    }
    toast.success(`${website.name} site opened`, {
      description: `Redirecting to ${website.name}...`,
      duration: 2000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className={clsx(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {t("event_info")}
        </h2>
        <p
          className={clsx(
            "text-sm mt-1",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {t("event_info_desc")}
        </p>
      </div>

      {/* Short Description */}
      {eventDetails?.shortDescription && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-blue-500/20" : "bg-blue-100",
              )}
            >
              <FileText
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-blue-400" : "text-blue-600",
                )}
              />
            </div>
            <div className="flex-1">
              <h3
                className={clsx(
                  "text-sm font-semibold uppercase tracking-wide mb-1",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {t("short_description")}
              </h3>
            </div>
          </div>
          <p
            className={clsx(
              "text-base leading-relaxed pl-11",
              isDark ? "text-gray-200" : "text-gray-800",
            )}
          >
            {eventDetails?.shortDescription}
          </p>
        </div>
      )}

      {/* Full Description */}
      {eventDetails?.description && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-purple-500/20" : "bg-purple-100",
              )}
            >
              <AlignLeft
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-purple-400" : "text-purple-600",
                )}
              />
            </div>
            <div className="flex-1">
              <h3
                className={clsx(
                  "text-sm font-semibold uppercase tracking-wide mb-1",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {t("full_description")}
              </h3>
            </div>
          </div>
          <p
            className={clsx(
              "text-base leading-relaxed whitespace-pre-wrap pl-11",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            {eventDetails?.description}
          </p>
        </div>
      )}

      {/* Website Connections */}
      {eventDetails?.associatedWebsites &&
        eventDetails?.associatedWebsites?.length > 0 && (
          <div
            className={clsx(
              "rounded-xl border p-6 transition-all duration-200",
              isDark
                ? "bg-linear-to-br from-gray-800 to-gray-800/50 border-gray-700"
                : "bg-linear-to-br from-blue-50 to-purple-50 border-blue-200",
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={clsx(
                  "p-2 rounded-lg",
                  isDark ? "bg-green-500/20" : "bg-green-100",
                )}
              >
                <Globe
                  className={clsx(
                    "w-5 h-5",
                    isDark ? "text-green-400" : "text-green-600",
                  )}
                />
              </div>
              <div>
                <h3
                  className={clsx(
                    "text-sm font-semibold uppercase tracking-wide",
                    isDark ? "text-gray-300" : "text-gray-700",
                  )}
                >
                  {t("connected_websites")}
                </h3>
                <p
                  className={clsx(
                    "text-xs mt-0.5",
                    isDark ? "text-gray-400" : "text-gray-600",
                  )}
                >
                  {eventDetails?.associatedWebsites.length}{" "}
                  {eventDetails?.associatedWebsites.length === 1
                    ? "website"
                    : "websites"}{" "}
                  connected
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {eventDetails?.associatedWebsites?.map((website: any) => (
                <button
                  key={website._id}
                  onClick={() => handleWebsiteClick(website)}
                  className={clsx(
                    "group relative flex items-center gap-3 px-4 py-3 border rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
                    isDark
                      ? "bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-900"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100",
                  )}
                  title={`Open ${website.name}`}
                >
                  <div
                    className={clsx(
                      "p-2 rounded-lg",
                      isDark ? "bg-gray-800" : "bg-gray-100",
                    )}
                  >
                    <ImageWithFallback
                      src={website?.logo || website?.url}
                      alt={website?.name}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <span
                    className={clsx(
                      "font-medium text-sm flex-1 text-left",
                      isDark ? "text-gray-200" : "text-gray-800",
                    )}
                  >
                    {website.name}
                  </span>
                  <ExternalLink
                    className={clsx(
                      "w-4 h-4 transition-all duration-200",
                      isDark
                        ? "text-gray-500 group-hover:text-blue-400"
                        : "text-gray-400 group-hover:text-blue-600",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
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

      {/* Empty State */}
      {!eventDetails?.shortDescription &&
        !eventDetails?.description &&
        !eventDetails?.associatedWebsites?.length &&
        !eventDetails?.internalNotes &&
        !(
          eventDetails?.status === "rejected" && eventDetails?.rejectionNote
        ) && (
          <div
            className={clsx(
              "rounded-xl border p-12 text-center",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-200",
            )}
          >
            <FileText
              className={clsx(
                "w-12 h-12 mx-auto mb-3",
                isDark ? "text-gray-600" : "text-gray-400",
              )}
            />
            <p
              className={clsx(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              No additional information available
            </p>
          </div>
        )}
    </div>
  );
};

export default EventInfoDetails;
