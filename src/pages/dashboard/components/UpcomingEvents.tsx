import { useTranslation } from "react-i18next";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

import { Link } from "react-router-dom";
import { routes } from "@/lib/routes";
import { ImageWithFallback, InfoTooltip } from "@/components/shared";
import { useGetAllEventsQuery } from "@/store/api/eventQueryApi";

export default function UpcomingEvents() {
  const { t } = useTranslation("dashboard");

  const { data: events } = useGetAllEventsQuery({
    page: 1,
    limit: 3,
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 dark:text-white">
          {t("upcoming_events")}
        </h2>
        <InfoTooltip
          content={t("upcoming_events_desc")}
          title={t("upcoming_events")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {events?.map((event: any) => (
          <div
            key={event._id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
          >
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
            <div className="p-4">
              <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">
                {event?.name}
              </h3>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{event?.dayDescription[0]?.date}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{event?.address?.location}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Show More Card */}
        <Link
          to={routes.eventsMgmt}
          className="bg-linear-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:shadow-lg transition-all cursor-pointer group min-h-[320px]"
        >
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-900 dark:text-white mb-1">
              {t("view_all")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {" "}
              View all upcoming activities
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
