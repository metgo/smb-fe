import clsx from "clsx";
import {
  Pencil,
  FileText,
  MapPin,
  CalendarClock,
  ImageIcon,
} from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { StatusPill } from "@/components/pills";
import { ImageWithFallback } from "@/components/shared";

interface TripPreviewProps {
  t: (key: string) => string;
  formData: {
    name: string | null;
    estimatedDuration: number | null;
    status: string;
    totalDistanceCovered: number | null;
    contactName: string;
    contactPhoneNumber: string;
    contactEmail: string;
  };
  description: string;
  shortDescription: string;
  selectedImages: SelectedImage[];
  selectedStationDetails: IStationDetailsProps[];
  selectedDmoId?: string;
  selectedAuthorityId?: string;
  websiteVisibilityIds?: string[];
  schedules?: ScheduleItem[];
  setCurrentStep?: React.Dispatch<React.SetStateAction<number>>;
}

// Step index map for edit navigation
const STEPS = {
  BASIC_INFO: 1,
  STATIONS: 2,
  ITENARY: 3,
  MEDIA: 4,
};

const TripPreview = ({
  t,
  formData,
  description,
  shortDescription,
  selectedImages,
  selectedStationDetails,
  selectedDmoId,
  selectedAuthorityId,
  websiteVisibilityIds,
  schedules,
  setCurrentStep,
}: TripPreviewProps) => {
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
    bgSecondary,
  } = useThemeClasses();
  const { dmosAuthorities, allWebsites } = useCommon();

  const selectedDmo = dmosAuthorities?.find((d) => d._id === selectedDmoId);
  const selectedAuthority = selectedDmo?.authorities?.find(
    (a: any) => a._id === selectedAuthorityId,
  );
  const selectedWebsites =
    allWebsites?.filter((w) => websiteVisibilityIds?.includes(w._id)) ?? [];

  const sectionCard = clsx("rounded-xl border overflow-hidden", borderColor);

  const sectionHeader = (
    icon: React.ReactNode,
    label: string,
    step: number,
  ) => (
    <div
      className={clsx(
        "flex items-center justify-between px-5 py-3",
        isDark ? "bg-white/5" : "bg-gray-50",
        "border-b",
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
      {setCurrentStep && (
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
      )}
    </div>
  );

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-0.5">
      <span className={clsx("text-xs", textTertiary)}>{label}</span>
      <div className={clsx("text-sm font-medium", textPrimary)}>
        {value || "—"}
      </div>
    </div>
  );

  const divider = <div className={clsx("border-t mx-5", borderColor)} />;

  return (
    <div className="space-y-5">
      {/* ══════════════════════════════════════════════
          STEP 1 – Basic Info
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <FileText className="w-4 h-4" />,
          t("step_basic_info"),
          STEPS.BASIC_INFO,
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("trip_name"), formData.name)}
            {row(t("status"), <StatusPill status={formData.status} />)}
          </div>

          {divider}

          <div className="grid grid-cols-1 gap-4">
            {row(
              t("short_description"),
              shortDescription?.replace(/<[^>]*>/g, ""),
            )}
          </div>

          {divider}

          <div className="grid grid-cols-1 gap-4">
            {row(t("description"), description?.replace(/<[^>]*>/g, ""))}
          </div>

          {divider}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {row(t("estimated_duration"), formData.estimatedDuration)}
            {row(t("total_distance_covered"), formData.totalDistanceCovered)}
          </div>

          {divider}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row(t("contact_name"), formData.contactName)}
            {row(t("contact_phone_number"), formData.contactPhoneNumber)}
            {row(t("contact_email"), formData.contactEmail)}
          </div>

          {(selectedDmo ||
            selectedAuthority ||
            selectedWebsites.length > 0) && (
            <>
              {divider}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {row(
                  t("select_dmo"),
                  selectedDmo && (
                    <div className="flex items-center gap-2">
                      <ImageWithFallback
                        src={selectedDmo?.logoPath}
                        alt={selectedDmo?.name}
                        className="w-5 h-5 object-contain rounded"
                      />
                      {selectedDmo.name}
                    </div>
                  ),
                )}
                {row(
                  t("select_authority"),
                  selectedAuthority && (
                    <div className="flex items-center gap-2">
                      <ImageWithFallback
                        src={selectedAuthority?.logoPath}
                        alt={selectedAuthority?.name}
                        className="w-5 h-5 object-contain rounded"
                      />
                      {selectedAuthority.name}
                    </div>
                  ),
                )}
              </div>

              {selectedWebsites.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className={clsx("text-xs", textTertiary)}>
                    {t("website_visibility")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWebsites.map((website) => (
                      <span
                        key={website._id}
                        className={clsx(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs",
                          borderColor,
                          bgSecondary,
                          textSecondary,
                        )}
                      >
                        <ImageWithFallback
                          src={website.logo}
                          alt={website.name}
                          className="w-4 h-4 object-contain rounded"
                        />
                        {website.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STEP 2 – Stations
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <MapPin className="w-4 h-4" />,
          t("step_stations"),
          STEPS.STATIONS,
        )}

        <div className="p-5">
          {selectedStationDetails.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedStationDetails.map((station) => (
                <span
                  key={station._id}
                  className="px-3 py-1.5 rounded-full text-sm bg-teal-500/20 text-teal-600"
                >
                  {station.name}
                </span>
              ))}
            </div>
          ) : (
            <span className={clsx("text-sm", textTertiary)}>—</span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STEP 3 – Itinerary
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <CalendarClock className="w-4 h-4" />,
          t("step_itenary"),
          STEPS.ITENARY,
        )}

        <div className="p-5 space-y-3">
          {schedules && schedules.length > 0 ? (
            schedules.map((schedule, idx) => (
              <div
                key={idx}
                className={clsx(
                  "flex items-center justify-between rounded-lg border px-3 py-2",
                  borderColor,
                  bgSecondary,
                )}
              >
                <span className={clsx("text-sm font-medium", textPrimary)}>
                  {schedule.title || "—"}
                </span>
                <span className={clsx("text-xs", textTertiary)}>
                  {schedule.startTime ?? "—"} - {schedule.endTime ?? "—"}
                </span>
              </div>
            ))
          ) : (
            <span className={clsx("text-sm", textTertiary)}>—</span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STEP 4 – Media
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <ImageIcon className="w-4 h-4" />,
          t("step_media"),
          STEPS.MEDIA,
        )}

        <div className="p-5">
          {selectedImages.length > 0 ? (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {selectedImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.image}
                  alt={img.alt || `Image ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <span className={clsx("text-sm", textTertiary)}>—</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPreview;
