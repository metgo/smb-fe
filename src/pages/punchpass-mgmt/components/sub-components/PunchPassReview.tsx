import clsx from "clsx";
import { Pencil, Tag, Layers, DollarSign, ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import { getLngWiseStr } from "@/helpers";

interface PunchPassReviewProps {
  t: (key: string) => string;
  formData: IPunchPassPayload;
  images: IImageUpload[];
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const STEPS = {
  BASIC_INFO: 1,
  CATALOGUES: 2,
  MEDIA: 3,
};

const PunchPassReview: React.FC<PunchPassReviewProps> = ({
  t,
  formData,
  images,
  setCurrentStep,
}) => {
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
    bgSecondary,
    language,
  } = useThemeClasses();
  const { t: tc } = useTranslation("common");

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
        {tc("edit")}
      </button>
    </div>
  );

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-0.5">
      <span className={clsx("text-xs", textTertiary)}>{label}</span>
      <div className={clsx("text-sm font-medium", textPrimary)}>
        {value || value === 0 ? value : "—"}
      </div>
    </div>
  );

  const badge = (text: string, key: string) => (
    <span
      key={key}
      className={clsx(
        "px-3 py-1 rounded-full border text-xs",
        borderColor,
        bgSecondary,
        textSecondary,
      )}
    >
      {text}
    </span>
  );

  const divider = <div className={clsx("border-t mx-5", borderColor)} />;

  const name = getLngWiseStr(
    language,
    formData.name,
    formData.nameHe,
    formData.nameAr,
  );
  const description = getLngWiseStr(
    language,
    formData.description,
    formData.descriptionHe,
    formData.descriptionAr,
  );

  return (
    <div className="space-y-5">
      {/* ── Basic Info ───────────────────────────────── */}
      <div className={sectionCard}>
        {sectionHeader(
          <Tag className="w-4 h-4" />,
          t("basic_info"),
          STEPS.BASIC_INFO,
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">{row(t("name"), name)}</div>

          {divider}

          <div className="grid grid-cols-1 gap-4">
            {row(t("description"), description)}
          </div>
        </div>
      </div>

      {/* ── Pricing / Quantity / Expiry ─────────────── */}
      <div className={sectionCard}>
        {sectionHeader(
          <DollarSign className="w-4 h-4" />,
          t("pricing_stock_dates"),
          STEPS.BASIC_INFO,
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {row(
              t("marked_price"),
              formData.price?.markedPrice
                ? `₪${formData.price.markedPrice}`
                : "—",
            )}
            {row(
              t("selling_price"),
              formData.price?.sellingPrice
                ? `₪${formData.price.sellingPrice}`
                : "—",
            )}
            {row(
              t("quantity"),
              formData.quantity?.isUnlimited
                ? t("unlimited")
                : (formData.quantity?.initial ?? "—"),
            )}
            {row(t("expiry_months"), formData.expiryDate ?? "—")}
          </div>
        </div>
      </div>

      {/* ── Catalogues ───────────────────────────────── */}
      <div className={sectionCard}>
        {sectionHeader(
          <Layers className="w-4 h-4" />,
          t("catalogues"),
          STEPS.CATALOGUES,
        )}

        <div className="p-5 space-y-3">
          {formData.catalogues?.length ? (
            formData.catalogues.map((item, idx) => {
              const catalogueName = getLngWiseStr(
                language,
                item.name,
                item.nameHe,
                item.nameAr,
              );
              return (
                <div
                  key={idx}
                  className={clsx(
                    "rounded-lg border px-3 py-2 flex flex-wrap items-center gap-2 justify-between",
                    borderColor,
                  )}
                >
                  <span className={clsx("text-sm font-medium", textPrimary)}>
                    {catalogueName || "—"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.type &&
                      badge(
                        t(`catalogue_type_${item.type.toLowerCase()}`),
                        `type-${idx}`,
                      )}
                    {!!item.quantity &&
                      badge(
                        `${t("catalogue_quantity")}: ${item.quantity}`,
                        `qty-${idx}`,
                      )}
                    {item.time && badge(item.time, `time-${idx}`)}
                  </div>
                </div>
              );
            })
          ) : (
            <span className={clsx("text-sm", textTertiary)}>
              {t("no_catalogues_added")}
            </span>
          )}
        </div>
      </div>

      {/* ── Images ───────────────────────────────────── */}
      <div className={sectionCard}>
        {sectionHeader(
          <ImageIcon className="w-4 h-4" />,
          t("images"),
          STEPS.MEDIA,
        )}
        <div>
          {images?.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-4">
              {images.map((img: any, index: number) => (
                <ImageWithFallback
                  key={index}
                  src={img?.image || img?.previewUrl}
                  alt="Uploaded image"
                  className="h-50 w-60 rounded-md shadow-md object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="p-5">
              <span className={clsx("text-sm", textTertiary)}>
                {t("no_images_up_loaded")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PunchPassReview;
