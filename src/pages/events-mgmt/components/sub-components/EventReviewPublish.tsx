import React from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import {
  CopyCheck,
  FileText,
  ImageIcon,
  MapPin,
  Pencil,
  TicketCheck,
} from "lucide-react";
import { formatDate } from "@/helpers/formatter";
import { extractCenterAddressText } from "@/helpers";
import clsx from "clsx";
import { ImageWithFallback } from "@/components/shared";

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
  images?: any;
}
const STEPS = {
  BASIC_INFO: 1,
  ADDRESS: 2,
  REGISTRATION: 3,
  TICKET: 4,
  IMAGES: 6,
};

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
  images,
}) => {
  const { t, i18n } = useTranslation("events");
  const { textPrimary, textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  const language = i18n.language as Language;

  const formatValue = (
    value: string | undefined,
    fallback: string = "not_set",
  ) => value || t(fallback);

  //helpers
  const sectionCard = clsx("rounded-xl border overflow-hidden", borderColor);

  const sectionHeader = (
    icon: React.ReactNode,
    label: string,
    step: number,
  ) => (
    <div
      className={clsx(
        "flex items-center justify-between px-5 py-3 border-b",
        isDark ? "bg-white/5" : "bg-gray-50",
        borderColor,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={clsx("opacity-60", textSecondary)}>{icon}</span>
        <span
          className={clsx(
            "text-sm font-semibold tracking-wide uppercase",
            textTertiary,
          )}
        >
          {label}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setCurrentStep(step)}
        className={clsx(
          "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
          isDark
            ? "text-teal-400 hover:bg-teal-950/50"
            : "text-teal-600 hover:bg-teal-50",
        )}
      >
        <Pencil className="w-3 h-3" />
        {t("edit")}
      </button>
    </div>
  );

  const row = (label: string, value: any) => (
    <div className="flex flex-col gap-0.5">
      <span className={clsx("text-xs", textTertiary)}>{label}</span>
      <span className={clsx("text-sm font-medium line-clamp-2", textPrimary)}>
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Basic Information */}
      <div className={sectionCard}>
        {sectionHeader(
          <FileText className="w-4 h-4" />,
          t("basic_information"),
          STEPS.BASIC_INFO,
        )}

        <div className="p-5 space-y-4">
          {/* Basic Info Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("name"), formatValue(eventName))}
            {row(t("language"), eventLanguage.toUpperCase())}
            {row(t("description"), formatValue(shortDescription))}
            {row(
              t("event_status"),
              <span className="capitalize">{t(eventStatus)}</span>,
            )}
          </div>
        </div>
      </div>

      {/* Date & Location */}
      <div className={sectionCard}>
        {sectionHeader(
          <MapPin className="w-4 h-4" />,
          t("date_location"),
          STEPS.ADDRESS,
        )}

        <div className="p-5 space-y-4">
          {/* Event Format and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(
              t("format"),
              <span className="capitalize">{t(eventFormat)}</span>,
            )}
            {row(
              t("type"),
              isMultiDay
                ? t("multi_day_event_text")
                : t("single_day_event_text"),
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {row(t("date"), !isMultiDay && formatDate(startDate, language))}
            {row(
              t("address"),
              eventFormat !== "online" && extractCenterAddressText(address),
            )}
            {row(
              t("online_link"),
              eventFormat !== "physical" &&
                formatValue(onlineLink, "not_applicable"),
            )}
          </div>
        </div>
      </div>

      {/* Registration */}
      <div className={sectionCard}>
        {sectionHeader(
          <CopyCheck className="w-4 h-4" />,
          t("registration"),
          STEPS.REGISTRATION,
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("required"), registrationRequired ? t("yes") : t("no"))}
            {row(
              t("capacity"),
              registrationRequired
                ? capacityType === "unlimited"
                  ? t("unlimited")
                  : `${capacity ?? 0} ${t("attendees")}`
                : null,
            )}
            {row(
              t("custom_questions"),
              registrationRequired
                ? `${customQuestions?.length ?? 0} ${
                    (customQuestions?.length ?? 0) === 1
                      ? t("question")
                      : t("questions")
                  }`
                : null,
            )}
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className={sectionCard}>
        {sectionHeader(
          <TicketCheck className="w-4 h-4" />,
          t("tickets"),
          STEPS.TICKET,
        )}

        <div className="p-5 space-y-4">
          {row(t("total_tickets"), tickets?.length)}

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

      {/* Images */}
      <div className={sectionCard}>
        {sectionHeader(
          <ImageIcon className="w-4 h-4" />,
          t("images"),
          STEPS.IMAGES,
        )}
        <div className="flex flex-wrap gap-2 p-4">
          {images?.map((img: any, index: any) => (
            <ImageWithFallback
              key={index}
              src={img?.image || img?.previewUrl}
              alt="Uploaded image"
              className="h-50 w-60 rounded-md shadow-md object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventReviewPublish;
