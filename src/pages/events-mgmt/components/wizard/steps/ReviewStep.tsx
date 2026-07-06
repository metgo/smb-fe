import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  CopyCheck,
  FileText,
  ImageIcon,
  MapPin,
  Pencil,
  TicketCheck,
} from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatDate } from "@/helpers/formatter";
import { extractCenterAddressText } from "@/helpers";
import { ImageWithFallback } from "@/components/shared";

// Step numbers that match the 8-step wizard
const WIZARD_STEPS = {
  BASIC_INFO: 1,
  DATE_TIME: 3,
  REGISTRATION: 4,
  TICKETS: 5,
  IMAGES: 7,
} as const;

interface ReviewStepProps {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  eventName: string;
  shortDescription: string;
  eventLanguage: string;
  eventStatus: string;
  isMultiDay: boolean;
  startDate: string;
  eventFormat: "physical" | "online" | "hybrid";
  address: string;
  onlineLink: string;
  registrationRequired: boolean;
  capacityType: "limited" | "unlimited";
  capacity: number;
  customQuestions: CustomQuestion[];
  tickets: TicketData[];
  images?: any[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({
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
  const { t } = useTranslation("events");
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
    language,
  } = useThemeClasses();

  const sectionCard = clsx("rounded-xl border overflow-hidden", borderColor);

  const SectionHeader = ({
    icon,
    label,
    step,
  }: {
    icon: React.ReactNode;
    label: string;
    step: number;
  }) => (
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

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col gap-0.5">
      <span className={clsx("text-xs", textTertiary)}>{label}</span>
      <span className={clsx("text-sm font-medium line-clamp-2", textPrimary)}>
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── Basic Information ─────────────────────────────────────────── */}
      <div className={sectionCard}>
        <SectionHeader
          icon={<FileText className="w-4 h-4" />}
          label={t("basic_information")}
          step={WIZARD_STEPS.BASIC_INFO}
        />
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Row label={t("name")} value={eventName || t("not_set")} />
            <Row label={t("language")} value={eventLanguage.toUpperCase()} />
            <Row
              label={t("description")}
              value={shortDescription || t("not_set")}
            />
            <Row
              label={t("event_status")}
              value={<span className="capitalize">{t(eventStatus)}</span>}
            />
          </div>
        </div>
      </div>

      {/* ── Date & Location ───────────────────────────────────────────── */}
      <div className={sectionCard}>
        <SectionHeader
          icon={<MapPin className="w-4 h-4" />}
          label={t("date_location")}
          step={WIZARD_STEPS.DATE_TIME}
        />
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Row
              label={t("format")}
              value={<span className="capitalize">{t(eventFormat)}</span>}
            />
            <Row
              label={t("type")}
              value={
                isMultiDay
                  ? t("multi_day_event_text")
                  : t("single_day_event_text")
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isMultiDay && (
              <Row label={t("date")} value={formatDate(startDate, language)} />
            )}
            {eventFormat !== "online" && (
              <Row
                label={t("address")}
                value={extractCenterAddressText(address)}
              />
            )}
            {eventFormat !== "physical" && (
              <Row
                label={t("online_link")}
                value={onlineLink || t("not_set")}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Registration ──────────────────────────────────────────────── */}
      <div className={sectionCard}>
        <SectionHeader
          icon={<CopyCheck className="w-4 h-4" />}
          label={t("registration")}
          step={WIZARD_STEPS.REGISTRATION}
        />
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Row
              label={t("required")}
              value={registrationRequired ? t("yes") : t("no")}
            />
            {registrationRequired && (
              <>
                <Row
                  label={t("capacity")}
                  value={
                    capacityType === "unlimited"
                      ? t("unlimited")
                      : `${capacity} ${t("attendees")}`
                  }
                />
                <Row
                  label={t("custom_questions")}
                  value={`${customQuestions?.length ?? 0} ${
                    customQuestions?.length === 1
                      ? t("question")
                      : t("questions")
                  }`}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tickets ───────────────────────────────────────────────────── */}
      <div className={sectionCard}>
        <SectionHeader
          icon={<TicketCheck className="w-4 h-4" />}
          label={t("tickets")}
          step={WIZARD_STEPS.TICKETS}
        />
        <div className="p-5 space-y-3">
          <Row
            label={t("total_tickets")}
            value={String(tickets?.length ?? 0)}
          />
          {tickets?.length > 0 ? (
            <ul className="space-y-1.5 ml-5 list-disc">
              {tickets.map((ticket, i) => (
                <li key={ticket._id ?? i}>
                  <span className={clsx("font-medium", textPrimary)}>
                    {ticket.name}
                  </span>{" "}
                  <span className="text-teal-500">({t(ticket.type)})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={clsx("text-sm italic", textTertiary)}>
              {t("no_tickets_created")}
            </p>
          )}
        </div>
      </div>

      {/* ── Images ────────────────────────────────────────────────────── */}
      <div className={sectionCard}>
        <SectionHeader
          icon={<ImageIcon className="w-4 h-4" />}
          label={t("images")}
          step={WIZARD_STEPS.IMAGES}
        />
        <div className="p-4">
          {images && images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {images.map((img: any, index: number) => (
                <ImageWithFallback
                  key={index}
                  src={img?.image || img?.previewUrl}
                  alt={`Image ${index + 1}`}
                  className="h-40 w-52 rounded-md shadow object-cover"
                />
              ))}
            </div>
          ) : (
            <p className={clsx("text-sm italic", textTertiary)}>
              {t("no_images_uploaded")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
