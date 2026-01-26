import { useTranslation } from "react-i18next";
import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Users,
  X,
} from "lucide-react";
import clsx from "clsx";

import { useAppSelector } from "@/hooks/hooks";
import { ImageWithFallback } from "@/components/shared";
import { extractCenterAddressText, extractEventDates } from "@/helpers";

interface QuickSnapEventDetailsProps {
  selectedEvent: any | null;
  setSelectedEvent: (v: Event | null) => void;
  handleViewDetails: () => void;
  handleEditEvent: () => void;
}

const QuickSnapEventDetails = ({
  selectedEvent,
  setSelectedEvent,
  handleEditEvent,
  handleViewDetails,
}: QuickSnapEventDetailsProps) => {
  const { t } = useTranslation("events");
  const { theme } = useAppSelector((state) => state.settings);

  if (!selectedEvent) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={clsx(
          "rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl",
          theme === "dark" ? "bg-gray-900" : "bg-white",
        )}
      >
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

          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Title + Actions */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2
              className={clsx(
                "text-3xl font-bold",
                theme === "dark" ? "text-white" : "text-gray-900",
              )}
            >
              {selectedEvent.name}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleViewDetails}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Details</span>
              </button>

              <button
                onClick={handleEditEvent}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-purple-500" />
              <div>
                <div className="font-medium">
                  {extractEventDates(selectedEvent?.dayDescription)}
                </div>
                <div
                  className={clsx(
                    "text-sm",
                    theme === "dark" ? "text-gray-400" : "text-gray-600",
                  )}
                >
                  {selectedEvent.startTime} – {selectedEvent.endTime}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-purple-500" />
              <div className="font-medium">
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
            {selectedEvent.registrationRequired && (
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-purple-500" />
                <div>
                  <div className="font-medium">
                    {selectedEvent.totalRegistrations} /{" "}
                    {selectedEvent.capacity} {t("registered")}
                  </div>

                  <div
                    className={clsx(
                      "w-64 mt-2 rounded-full h-3",
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200",
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
                  theme === "dark"
                    ? "bg-purple-900/30 border-purple-800"
                    : "bg-purple-50 border-purple-200",
                )}
              >
                <div
                  className={clsx(
                    "text-sm mb-1",
                    theme === "dark" ? "text-gray-400" : "text-gray-600",
                  )}
                >
                  {t("totalRevenue")}
                </div>
                <div
                  className={clsx(
                    "text-3xl font-bold",
                    theme === "dark" ? "text-purple-400" : "text-purple-600",
                  )}
                >
                  ₪ 0{/* {selectedEvent?.revenue?.toLocaleString()} */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSnapEventDetails;
