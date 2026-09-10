import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Edit, Eye, MapPin, Users } from "lucide-react";

import { routes } from "@/lib/routes";
import { ModalWrapper } from "@/components/wrapper";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { extractCenterAddressText, extractEventDates } from "@/helpers";

interface QuickSnapEventDetailsProps {
  selectedEvent: any | null;
  setIsOpen: (v: boolean) => void;
  setSelectedEvent: (v: Event | null) => void;
  handleEditEvent: () => void;
}

const QuickSnapEventDetails = ({
  setIsOpen,
  selectedEvent,
  setSelectedEvent,
  handleEditEvent,
}: QuickSnapEventDetailsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("common");
  const { isDark, textSecondary } = useThemeClasses();

  const handleEventDetailsNavigate = () => {
    navigate(`${routes.eventDetails}?eventId=${selectedEvent?._id}`, {
      replace: true,
    });
  };

  if (!selectedEvent) return null;

  const handleClose = () => {
    setIsOpen(false);
    setSelectedEvent(null);
  };

  return (
    <ModalWrapper onClose={handleClose} height="max-h" maxWidth="max-w-3xl">
      {/* Header Image */}
      <div className="relative h-64 rounded-t-2xl overflow-hidden">
        {selectedEvent?.images?.[0]?.image ? (
          <ImageWithFallback
            src={selectedEvent.images?.[0]?.image}
            alt={selectedEvent.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Calendar className="w-32 h-32 text-white/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2
              className={clsx(
                "text-3xl font-bold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {selectedEvent.name}
            </h2>
            <p className="text-lg">{selectedEvent?.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEventDetailsNavigate}
              className=" cursor-pointer flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{tc("details")}</span>
            </button>

            <button
              onClick={handleEditEvent}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">{tc("edit")}</span>
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Date & Time */}
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-purple-500" />
            <div>
              <div className={clsx("font-medium", textSecondary)}>
                {extractEventDates(selectedEvent?.dayDescription)}
              </div>
              <div
                className={clsx(
                  "text-sm",
                  isDark ? "text-gray-200" : "text-gray-600",
                )}
              >
                {selectedEvent?.startTime} – {selectedEvent?.endTime}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-4">
            <MapPin className="w-6 h-6 text-purple-500" />
            <div className={clsx("font-medium", textSecondary)}>
              {extractCenterAddressText(selectedEvent?.address?.location)}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <DollarSign className="w-6 h-6 text-purple-500" />
            <div
              className={clsx(
                "font-medium",
                selectedEvent.isFree ? "text-emerald-600" : "text-purple-600",
              )}
            >
              {selectedEvent.isFree ? t("free") : `₪ 0`}
            </div>
          </div>

          {/* Registration */}
          {selectedEvent?.registrationRequired && (
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-purple-500" />
              <div>
                <div className="font-medium">
                  {selectedEvent.totalRegistrations} / {selectedEvent.capacity}{" "}
                  {t("registered")}
                </div>

                <div
                  className={clsx(
                    "w-64 mt-2 rounded-full h-3",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                >
                  <div
                    className="bg-linear-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    style={{
                      width: `${
                        (selectedEvent.totalRegistrations /
                          selectedEvent.capacity) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Revenue */}
          {!selectedEvent.isFree && (
            <div
              className={clsx(
                "p-6 rounded-xl border",
                isDark
                  ? "bg-purple-900/30 border-purple-800"
                  : "bg-purple-50 border-purple-200",
              )}
            >
              <div
                className={clsx(
                  "text-sm mb-1",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {t("total_revenue")}
              </div>
              <div
                className={clsx(
                  "text-3xl font-bold",
                  isDark ? "text-purple-400" : "text-purple-600",
                )}
              >
                ₪ 0{/* {selectedEvent?.revenue?.toLocaleString()} */}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default QuickSnapEventDetails;
