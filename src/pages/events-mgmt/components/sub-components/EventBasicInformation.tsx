import React from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface EventBasicInformationProps {
  currentStep: number;

  // Basic fields
  eventName: string;
  setEventName: React.Dispatch<React.SetStateAction<string>>;
  shortDescription: string;
  setShortDescription: React.Dispatch<React.SetStateAction<string>>;
  fullDescription: string;
  setFullDescription: React.Dispatch<React.SetStateAction<string>>;
  eventStatus: "draft" | "pending" | "approved";
  setEventStatus: React.Dispatch<React.SetStateAction<"draft" | "pending" | "approved">>;
  internalNotes: string;
  setInternalNotes: React.Dispatch<React.SetStateAction<string>>;

  // Errors
  errors: {
    eventName?: string;
  };
}

const EventBasicInformation: React.FC<EventBasicInformationProps> = ({
  currentStep,
  eventName,
  setEventName,
  shortDescription,
  setShortDescription,
  fullDescription,
  setFullDescription,
  eventStatus,
  setEventStatus,
  internalNotes,
  setInternalNotes,
  errors,
}) => {
  const { t } = useTranslation("events");
  const { textSecondary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  // Reusable input classes
  const inputClasses = theme === "dark"
    ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-teal-500"
    : "bg-white border-gray-300 text-gray-900 focus:border-teal-500";

  if (currentStep !== 1) return null;

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      {/* Event Name */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("event_name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder={t("enter_event_name")}
          className={`w-full px-5 py-3 rounded-xl border text-lg ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20 ${
            errors.eventName ? "border-red-500" : ""
          }`}
        />
        {errors.eventName && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            {errors.eventName}
          </p>
        )}
      </div>

      {/* Short Description */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("short_description")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder={t("brief_description")}
          maxLength={200}
          className={`w-full px-5 py-3 rounded-xl border text-base ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20`}
        />
        <p className={`text-xs mt-2 text-right ${textTertiary}`}>
          {shortDescription.length}/200 {t("max_characters")}
        </p>
      </div>

      {/* Full Description */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("full_description")}
        </label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          placeholder={t("full_event_description")}
          rows={8}
          className={`w-full px-5 py-4 rounded-xl border resize-none text-base ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20`}
        />
      </div>

      {/* Event Status */}
      <div>
        <label className={`block text-sm font-medium mb-4 ${textSecondary}`}>
          {t("event_status")}
        </label>
        <div className="flex flex-wrap gap-6">
          {(["draft", "pending", "approved"] as const).map((status) => (
            <label
              key={status}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="eventStatus"
                value={status}
                checked={eventStatus === status}
                onChange={(e) => setEventStatus(e.target.value as any)}
                className="w-5 h-5 text-teal-500 focus:ring-teal-500 focus:ring-2"
              />
              <span className={`text-base capitalize font-medium ${textSecondary} group-hover:text-teal-500 transition-colors`}>
                {t(status)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Internal Notes */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("internal_notes")}
          <span className={`text-xs ml-2 ${textTertiary}`}>({t("visible_only_to_admins")})</span>
        </label>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder={t("add_internal_notes")}
          rows={4}
          className={`w-full px-5 py-4 rounded-xl border resize-none text-base ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20`}
        />
      </div>
    </div>
  );
};

export default EventBasicInformation;