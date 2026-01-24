import React from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { formatDate } from "@/helpers/formatter";
import { extractCenterAddressText } from "@/helpers";

interface CustomQuestion {
  id: string;
  label: string;
  type: string;
}

interface EventReviewPublishProps {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;

  // Basic Info (Step 1)
  eventName: string;
  shortDescription: string;
  eventLanguage: string;
  eventStatus: string;

  // Date & Location (Step 2)
  isMultiDay: boolean;
  startDate: string;
  eventFormat: "physical" | "online" | "hybrid";
  address: string;
  onlineLink: string;

  // Registration & Capacity (Step 3)
  registrationRequired: boolean;
  capacityType: "limited" | "unlimited";
  capacity: number;
  customQuestions: CustomQuestion[];

  // Tickets (Step 4)
  tickets: TicketData[];
}

const EventReviewPublish: React.FC<EventReviewPublishProps> = ({
  setCurrentStep,
  eventName,
  shortDescription,
  eventLanguage,
  eventStatus,
  isMultiDay,
  startDate,
  eventFormat,
  address,
  onlineLink,
  registrationRequired,
  capacityType,
  capacity,
  customQuestions,
  tickets,
}) => {
  const { t, i18n } = useTranslation("events");
  const { textPrimary, textSecondary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  const language = i18n.language as Language;

  const formatValue = (value: string | undefined, fallback: string = "not_set") =>
    value || t(fallback);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-5 text-teal-500" />
        <h2 className={`text-3xl font-bold mb-3 ${textPrimary}`}>
          {t("review_your_event")}
        </h2>
        <p className={`text-lg ${textTertiary}`}>
          {t("review_all_details")}
        </p>
      </div>

      {/* Basic Information */}
      <div className={`p-8 rounded-2xl border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${textPrimary}`}>
            {t("basic_information")}
          </h3>
          <button
            onClick={() => setCurrentStep(1)}
            className="text-teal-500 hover:text-teal-600 font-medium transition-colors"
          >
            {t("edit")}
          </button>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-base ${textSecondary}`}>
          <p><strong>{t("name")}:</strong> {formatValue(eventName)}</p>
          <p><strong>{t("language")}:</strong> {eventLanguage.toUpperCase()}</p>
          <p><strong>{t("description")}:</strong> {formatValue(shortDescription)}</p>
          <p><strong>{t("event_status")}:</strong> <span className="capitalize">{t(eventStatus)}</span></p>
        </div>
      </div>

      {/* Date & Location */}
      <div className={`p-8 rounded-2xl border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${textPrimary}`}>
            {t("date_location")}
          </h3>
          <button
            onClick={() => setCurrentStep(2)}
            className="text-teal-500 hover:text-teal-600 font-medium transition-colors"
          >
            {t("edit")}
          </button>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-base ${textSecondary}`}>
          <p><strong>{t("format")}:</strong> <span className="capitalize">{t(eventFormat)}</span></p>
          <p><strong>{t("type")}:</strong> {isMultiDay ? t("multi_day_event_text") : t("single_day_event_text")}</p>
          {!isMultiDay && <p><strong>{t("date")}:</strong> {formatDate(startDate, language)}</p>}
          {eventFormat !== "online" && <p><strong>{t("address")}:</strong> {extractCenterAddressText(address)}</p>}
          {eventFormat !== "physical" && <p><strong>{t("online_link")}:</strong> {formatValue(onlineLink, "not_applicable")}</p>}
        </div>
      </div>

      {/* Registration */}
      <div className={`p-8 rounded-2xl border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${textPrimary}`}>
            {t("registration")}
          </h3>
          <button
            onClick={() => setCurrentStep(3)}
            className="text-teal-500 hover:text-teal-600 font-medium transition-colors"
          >
            {t("edit")}
          </button>
        </div>
        <div className={`space-y-4 text-base ${textSecondary}`}>
          <p>
            <strong>{t("required")}:</strong> {registrationRequired ? t("yes") : t("no")}
          </p>
          {registrationRequired && (
            <>
              <p>
                <strong>{t("capacity")}:</strong>{" "}
                {capacityType === "unlimited" ? t("unlimited") : `${capacity ?? 0} ${t("attendees")}`}
              </p>
              <p>
                <strong>{t("custom_questions")}:</strong> {customQuestions?.length}{" "}
                {customQuestions?.length === 1 ? t("question") : t("questions")}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Tickets */}
      <div className={`p-8 rounded-2xl border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${textPrimary}`}>
            {t("tickets")}
          </h3>
          <button
            onClick={() => setCurrentStep(4)}
            className="text-teal-500 hover:text-teal-600 font-medium transition-colors"
          >
            {t("edit")}
          </button>
        </div>
        <div className={`text-base ${textSecondary}`}>
          <p className="mb-3">
            <strong>{t("total_tickets")}:</strong> {tickets?.length}
          </p>
          {tickets?.length > 0 ? (
            <ul className="space-y-2 ml-6 list-disc">
              {tickets?.map((ticket, i) => (
                <li key={i}>
                  <span className="font-medium">{ticket?.name}</span>{" "}
                  <span className="text-teal-500">({t(ticket?.type)})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic">{t("no_tickets_created")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventReviewPublish;