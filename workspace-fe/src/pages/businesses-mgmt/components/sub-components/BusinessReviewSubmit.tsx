import clsx from "clsx";
import {
  Tag,
  MapPin,
  Pencil,
  ImageIcon,
  Globe,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { type FC } from "react";
import { ImageWithFallback } from "@/components/shared";
import { useTranslation } from "react-i18next";
import SectionAttributeCard from "@/components/details-sections/SectionAttributeCard";

interface BusinessReviewSubmitProps {
  selectedGroupTypesId: string[];
  selectedAccessiblitiesId: string[];
  formData: {
    name: string;
    shortDescription: string;
    fullDescription: string;
    email: string;
    phone: string;
    address: string;
    geo?: string;
    primaryCategory: string;
    logo: string | null;
    tags: any;
    socialMedia: any;
    operatingHours: any[];
    deliveryArea: any;
  };
  images?: any;
  address: string;
  geo?: {
    lat: string;
    long: string;
  };
  t: (key: string) => string;
  setCurrentStep: (v: number) => void;
}
const STEPS = {
  BASIC_INFO: 1,
  CONTACT: 2,
  ADDRESS: 3,
  CATEGORY: 4,
  IMAGES: 5,
  HOURS: 6,
  DELIVERY: 7,
  ONLINE: 8,
};

const BusinessReviewSubmit: FC<BusinessReviewSubmitProps> = ({
  t,
  formData,
  setCurrentStep,
  address,
  geo,
  images,
  selectedGroupTypesId,
  selectedAccessiblitiesId,
}) => {
  const { t: tc } = useTranslation("common");
  const { categories, socialMedia, accessibility, groupTypes } = useCommon();
  const { textPrimary, textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();
  const allSocialMedia: any[] = socialMedia?.datas?.data ?? [];
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

  const divider = <div className={clsx("border-t mx-5", borderColor)} />;

  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <div className={sectionCard}>
        {sectionHeader(
          <FileText className="w-4 h-4" />,
          t("basic_information"),
          STEPS.BASIC_INFO,
        )}
        <div className="p-5 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-1 gap-4">
            {row(tc("name"), formData.name)}
          </div>

          {divider}

          {/* Short description */}
          <div className="grid grid-cols-1 gap-4">
            {row(tc("short_description"), formData.shortDescription)}
          </div>

          {divider}

          {/* Full description */}
          <div className="grid grid-cols-1 gap-4">
            {row(tc("full_description"), formData.fullDescription)}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className={sectionCard}>
        {sectionHeader(
          <Users className="w-4 h-4" />,
          t("contact_information"),
          STEPS.CONTACT,
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row(t("business_email"), formData.email)}
            {row(t("phone_number"), formData.phone)}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className={sectionCard}>
        {sectionHeader(
          <MapPin className="w-4 h-4" />,
          t("address"),
          STEPS.ADDRESS,
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row(t("address"), address)}
            {row(
              t("geo"),
              geo?.lat && geo?.long
                ? `${Number(geo.lat).toFixed(4)}, ${Number(geo.long).toFixed(4)}`
                : null,
            )}
          </div>
        </div>
      </div>

      {/* Category */}
      <div className={sectionCard}>
        {sectionHeader(
          <Tag className="w-4 h-4" />,
          t("attributes"),
          STEPS.CATEGORY,
        )}
        <SectionAttributeCard
          isDark={isDark}
          rows={[
            {
              label: t("primary_category"),
              value: formData?.primaryCategory
                ? categories?.find(
                    (cat: any) => cat._id === formData.primaryCategory,
                  )?.name
                : "—",
            },
            {
              label: t("accessiblities"),
              value: selectedAccessiblitiesId
                ? accessibility
                    ?.filter((cat: any) =>
                      selectedAccessiblitiesId.includes(cat._id),
                    )
                    ?.map((cat: any) => cat.name)
                    ?.join(", ")
                : "—",
            },
            {
              label: t("group_types"),
              value: selectedGroupTypesId
                ? groupTypes
                    ?.filter((cat: any) =>
                      selectedGroupTypesId.includes(cat._id),
                    )
                    ?.map((cat: any) => cat.name)
                    ?.join(", ")
                : "—",
            },
          ]}
          tags={formData?.tags}
        />
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
              className="h-32 w-full sm:h-40 sm:w-48 rounded-md shadow-md object-cover"
            />
          ))}
        </div>
      </div>

      {/* delivery */}
      <div className={sectionCard}>
        {sectionHeader(
          <MapPin className="w-4 h-4" />,
          t("delivery_areas_pricing"),
          STEPS.DELIVERY,
        )}

        <div className="p-5 space-y-4">
          {(formData.deliveryArea && formData.deliveryArea.length > 0
            ? formData.deliveryArea
            : [{}]
          ) // fallback to one empty object if no data
            .map((deliveryArea: any, areaIdx: any) => (
              <div key={areaIdx} className="p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>{row(t("delivery_area"), deliveryArea.area)}</div>
                  <div>{row(t("delivery_price"), deliveryArea.price)}</div>
                  <div>
                    {row(
                      t("pickup_locations"),
                      deliveryArea.pickUpLocation?.length ?? 0,
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* HOURS */}
      <div className={sectionCard}>
        {sectionHeader(
          <Clock className="w-4 h-4" />,
          t("opening_hours"),
          STEPS.HOURS,
        )}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.operatingHours && formData.operatingHours.length > 0 ? (
            formData.operatingHours.map((hour: any, index: number) => {
              const display = hour.isHoliday
                ? t("closed")
                : hour.slots && hour.slots.length > 0
                  ? hour.slots
                      .filter((slot: any) => slot.open && slot.close)
                      .map(
                        (slot: any) => `${slot.open} ${t("to")} ${slot.close}`,
                      )
                      .join(", ")
                  : "—";

              return (
                <div key={index} className="flex flex-col">
                  <span className={clsx("font-medium text-sm", textTertiary)}>
                    {t(hour.day)}
                  </span>
                  <span className={clsx("text-sm", textPrimary)}>
                    {display}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col">
              <span className={clsx("text-sm", textPrimary)}>—</span>
            </div>
          )}
        </div>
      </div>

      {/* Online Presence */}
      <div className={sectionCard}>
        {sectionHeader(
          <Globe className="w-4 h-4" />,
          t("online_presence"),
          STEPS.ONLINE,
        )}

        {formData.socialMedia?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 p-5">
            {formData.socialMedia.map((sm: any, index: number) => {
              const platform = allSocialMedia.find(
                (p) => p._id === sm.socialMediaId,
              );

              const label = platform?.name || "Unknown";
              const iconPath = platform?.icon?.iconPath || "";

              return (
                <div key={index} className="flex items-center gap-2">
                  {iconPath && (
                    <img
                      src={iconPath}
                      alt={label}
                      className="w-5 h-5 rounded-md"
                    />
                  )}
                  <span className={clsx("text-sm font-medium", textPrimary)}>
                    {label}:{" "}
                    <a
                      href={sm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clsx(
                        "text-teal-500 hover:underline",
                        isDark ? "text-teal-400" : "text-teal-600",
                      )}
                    >
                      {sm.url}
                    </a>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <span className={clsx("text-sm", textPrimary)}>—</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessReviewSubmit;
