import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Trash2,
  Plus,
  MapPin,
  Globe,
} from "lucide-react";
import DatePicker from "@/components/shared/DatePicker";
import GooglePlacesAutocomplete from "@/components/shared/GooglePlacesAutocomplete";

interface EventDay {
  id: string;
  date: string; // ISO date string, e.g., "2026-01-15"
  startTime: string; // "14:30"
  endTime: string; // "18:00"
  description: string
}

type EventFormat = "physical" | "online" | "hybrid";

interface EventDateTimeFormatProps {
  // Multi-day toggle
  isMultiDay: boolean;
  setIsMultiDay: React.Dispatch<React.SetStateAction<boolean>>;

  // Single day
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;

  // Event days (for both single and multi-day)
  eventDays: EventDay[];
  setEventDays: React.Dispatch<React.SetStateAction<EventDay[]>>;

  // Event format
  eventFormat: EventFormat;
  setEventFormat: React.Dispatch<React.SetStateAction<EventFormat>>;

  // Location & online link
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  onlineLink: string;
  setOnlineLink: React.Dispatch<React.SetStateAction<string>>;

  // Errors
  errors: {
    startDate?: string;
    address?: string;
    onlineLink?: string;
  };

  // Helper functions for multi-day
  addEventDay: () => void;
  removeEventDay: (id: string) => void;
}

const EventDateTimeFormat: React.FC<EventDateTimeFormatProps> = ({
  isMultiDay,
  setIsMultiDay,
  startDate,
  setStartDate,
  eventDays,
  setEventDays,
  eventFormat,
  setEventFormat,
  address,
  setAddress,
  onlineLink,
  setOnlineLink,
  errors,
  addEventDay,
  removeEventDay,
}) => {
  const { t } = useTranslation("events");
  const { textSecondary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  // Common input classes for consistency
  const inputClasses = theme === "dark"
    ? "bg-gray-800 border-gray-700 text-gray-100"
    : "bg-white border-gray-300 text-gray-900";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Event Duration: Single vs Multi-day */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>{t("event_duration")}</label>
        <div className="flex gap-4">
          <button
            onClick={() => setIsMultiDay(false)}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
              !isMultiDay
                ? "border-teal-500 bg-teal-500/10 text-teal-500"
                : theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">{t("single_day")}</span>
          </button>
          <button
            onClick={() => setIsMultiDay(true)}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
              isMultiDay
                ? "border-teal-500 bg-teal-500/10 text-teal-500"
                : theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">{t("multi_day")}</span>
          </button>
        </div>
      </div>

      {/* Date & Time Input */}
      {!isMultiDay ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date)}
              placeholder={t("select_date")}
              theme={theme}
              error={errors.startDate}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t("start_time")}</label>
            <input
              type="time"
              value={eventDays[0]?.startTime || ""}
              onChange={(e) =>
                setEventDays([{ ...eventDays[0], startTime: e.target.value }])
              }
              className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t("end_time")}</label>
            <input
              type="time"
              value={eventDays[0]?.endTime || ""}
              onChange={(e) =>
                setEventDays([{ ...eventDays[0], endTime: e.target.value }])
              }
              className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {eventDays.map((day, index) => (
            <div
              key={day.id}
              className={`p-4 rounded-lg border ${
                theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${textSecondary}`}>{t("day")} {index + 1}</span>
                {eventDays.length > 1 && (
                  <button
                    onClick={() => removeEventDay(day.id)}
                    className="text-red-500 hover:text-red-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DatePicker
                  value={day.date}
                  onChange={(date) => {
                    const updated = [...eventDays];
                    updated[index].date = date;
                    setEventDays(updated);
                  }}
                  placeholder={t("select_date")}
                  theme={theme}
                />
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => {
                    const updated = [...eventDays];
                    updated[index].startTime = e.target.value;
                    setEventDays(updated);
                  }}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => {
                    const updated = [...eventDays];
                    updated[index].endTime = e.target.value;
                    setEventDays(updated);
                  }}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addEventDay}
            className={`w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center ${
              theme === "dark"
                ? "border-gray-700 hover:border-teal-500 hover:bg-gray-800"
                : "border-gray-300 hover:border-teal-500 hover:bg-gray-50"
            }`}
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-sm">{t("add_another_day")}</span>
          </button>
        </div>
      )}

      {/* Event Format */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>{t("event_format")}</label>
        <div className="grid grid-cols-3 gap-3">
          {(["physical", "online", "hybrid"] as const).map((format) => (
            <button
              key={format}
              onClick={() => setEventFormat(format)}
              className={`px-4 py-3 rounded-lg border capitalize transition-colors flex flex-col items-center ${
                eventFormat === format
                  ? "border-teal-500 bg-teal-500/10 text-teal-500"
                  : theme === "dark"
                    ? "border-gray-700 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {format === "physical" ? (
                <MapPin className="w-5 h-5 mb-1" />
              ) : (
                <Globe className="w-5 h-5 mb-1" />
              )}
              <span className="text-sm">{t(format)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Physical / Hybrid Location */}
      {eventFormat !== "online" && (
        <div>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            {t("location_address")} <span className="text-red-500">*</span>
          </label>
          <GooglePlacesAutocomplete
            value={address}
            onChange={(value) => setAddress(value)}
            placeholder={t("search_location")}
            theme={theme}
            error={errors.address}
          />
        </div>
      )}

      {/* Online / Hybrid Link */}
      {eventFormat !== "physical" && (
        <div>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            {t("online_event_link")} <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={onlineLink}
            onChange={(e) => setOnlineLink(e.target.value)}
            placeholder="https://zoom.us/..."
            className={`w-full px-4 py-2 rounded-lg border ${inputClasses} ${errors.onlineLink ? "border-red-500" : ""}`}
          />
          {errors.onlineLink && (
            <p className="text-red-500 text-sm mt-1">{errors.onlineLink}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDateTimeFormat;