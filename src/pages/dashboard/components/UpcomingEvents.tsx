import clsx from "clsx";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, MapPin, ArrowRight, ArrowLeft } from "lucide-react";

import { routes } from "@/lib/routes";
import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback, InfoTooltip } from "@/components/shared";
import { useGetAllUpcomingEventsQuery } from "@/store/api/eventQueryApi";

export default function UpcomingEvents() {
  const { t } = useTranslation("dashboard");
  const { isDark, language, isRTL } = useThemeClasses();

  const { data: events } = useGetAllUpcomingEventsQuery();

  if (events?.data?.length === 0) return null;

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className={clsx(
            "font-semibold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {t("upcoming_events")}
        </h2>

        <InfoTooltip
          content={t("upcoming_events_desc")}
          title={t("upcoming_events")}
        />
      </div>

      {/* Events Grid */}
      <div className="overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0">
        <div className="grid grid-flow-col auto-cols-[260px] gap-2 md:gap-6 lg:grid-flow-row lg:grid-cols-4 lg:auto-cols-auto">
          {events?.data?.map((event: IUpcommingEvent) => {
            const localizedName =
              language === "he"
                ? event.nameHe || event.name
                : language === "ar"
                  ? event.nameAr || event.name
                  : event.name;

            return (
              <Link
                key={event._id}
                to={`${routes.eventDetails}?eventId=${event._id}`}
                className={clsx(
                  "rounded-xl border overflow-hidden hover:shadow-lg transition-all group",
                  isDark
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200",
                )}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={event.image ?? undefined}
                    alt={localizedName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Event Details */}
                <div className="p-4">
                  <h3
                    className={clsx(
                      "mb-2 line-clamp-2 font-semibold",
                      isDark ? "text-white" : "text-gray-900",
                    )}
                  >
                    {localizedName}
                  </h3>

                  <div
                    className={clsx(
                      "flex items-start gap-2 text-sm mb-2",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{formatDate(event.upcomingDate, language)}</span>
                  </div>

                  <div
                    className={clsx(
                      "flex items-start gap-2 text-sm",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">
                      {event.address?.location}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Show More Card */}
          <Link
            to={routes.eventsMgmt}
            className={clsx(
              "rounded-xl border flex items-center justify-center hover:shadow-lg transition-all cursor-pointer group min-h-[320px] p-6",
              isDark
                ? "bg-teal-950/30 to-blue-950/30 border-gray-800"
                : "bg-linear-to-br from-teal-50 to-blue-50 border-gray-200",
            )}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                {isRTL ? (
                  <ArrowLeft className="w-6 h-6 text-white" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-white" />
                )}
              </div>

              <p
                className={clsx(
                  "mb-1 font-semibold",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {t("view_all")}
              </p>

              <p
                className={clsx(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {t("view_all_upcoming_activities")}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
