import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { routes } from "@/lib/routes";
import { ImageWithFallback, InfoTooltip } from "@/components/shared";
import { useGetAllEventsQuery } from "@/store/api/eventQueryApi";
import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";

export default function UpcomingEvents() {
  const { t, i18n } = useTranslation("dashboard");
  const language = i18n?.language as Language;
  const { isDark } = useThemeClasses();

  const { data: events } = useGetAllEventsQuery({
    page: 1,
    limit: 3,
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {events?.map((event: any) => (
          <div
            key={event._id}
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
                src={
                  event?.images?.find((img: any) => img?.isPrimary)?.image ||
                  event?.images[0]?.image
                }
                alt={event?.name}
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
                {event?.name}
              </h3>

              <div
                className={clsx(
                  "flex items-start gap-2 text-sm mb-2",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  {formatDate(event?.dayDescription[0]?.date, language)}
                </span>
              </div>

              <div
                className={clsx(
                  "flex items-start gap-2 text-sm",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{event?.address?.location}</span>
              </div>
            </div>
          </div>
        ))}

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
              <ArrowRight className="w-6 h-6 text-white" />
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
    </section>
  );
}
