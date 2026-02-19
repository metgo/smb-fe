import clsx from "clsx";
import {
  Pencil,
  Tag,
  Layers,
  DollarSign,
  Truck,
  ImageIcon,
} from "lucide-react";
import { getMatchedItems } from "@/helpers";
import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "@/components/shared";

interface ProductReviewSubmitProps {
  formData: any;
  images: IImageUpload[];
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

// Step index map for edit navigation
const STEPS = {
  BASIC_INFO: 1,
  ATTRIBUTES: 2,
  PRICING: 3,
  IMAGES: 4,
  DELIVERY: 5,
};

const ProductReviewSubmit: React.FC<ProductReviewSubmitProps> = ({
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
    bgTertiary,
    bgSecondary,
  } = useThemeClasses();
  const { t } = useTranslation("common");
  const { t: tb } = useTranslation("businesses");
  const { categories, subCategories } = useCommon();
  console.log("formData.images", formData.images);

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
        {t("edit")}
      </button>
    </div>
  );

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-0.5">
      <span className={clsx("text-xs", textTertiary)}>{label}</span>
      <span className={clsx("text-sm font-medium", textPrimary)}>
        {value || "—"}
      </span>
    </div>
  );

  const badge = (text: string, key: string) => (
    <span
      key={key}
      className={clsx(
        "px-3 py-1 rounded-full border",
        borderColor,
        bgSecondary,
        textSecondary,
      )}
    >
      {text}
    </span>
  );

  const divider = <div className={clsx("border-t mx-5", borderColor)} />;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ══════════════════════════════════════════════
          STEP 1 – Basic Info
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <Tag className="w-4 h-4" />,
          t("basic_info"),
          STEPS.BASIC_INFO,
        )}

        <div className="p-5 space-y-4">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row(t("name"), formData.name)}
            {row(t("name_he"), formData.nameHe)}
            {row(t("name_ar"), formData.nameAr)}
          </div>

          {divider}

          {/* Short descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row(t("short_description_en"), formData.shortDescription)}
            {row(t("short_description_he"), formData.shortDescriptionHe)}
            {row(t("short_description_ar"), formData.shortDescriptionAr)}
          </div>

          {divider}

          {/* Full descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row(t("full_description_en"), formData.fullDescription)}
            {row(t("full_description_he"), formData.fullDescriptionHe)}
            {row(t("full_description_ar"), formData.fullDescriptionAr)}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STEP 2 – Attributes (Categories)
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <Layers className="w-4 h-4" />,
          t("attributes"),
          STEPS.ATTRIBUTES,
        )}

        <div className="p-5 space-y-4">
          <div>
            <p className={clsx("text-xs mb-2", textTertiary)}>
              {t("categories")}
            </p>
            <div className="flex flex-wrap gap-2">
              {getMatchedItems(categories, formData?.categories)?.map(
                (item: any) => badge(item.name, item._id),
              ) || <span className={clsx("text-sm", textTertiary)}>—</span>}
            </div>
          </div>

          {divider}

          <div>
            <p className={clsx("text-xs mb-2", textTertiary)}>
              {t("sub_categories")}
            </p>
            <div className="flex flex-wrap gap-2">
              {getMatchedItems(subCategories, formData?.subCategories)?.map(
                (item: any) => badge(item.name, item._id),
              ) || <span className={clsx("text-sm", textTertiary)}>—</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STEP 3 – Pricing, Stock & Dates
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <DollarSign className="w-4 h-4" />,
          t("pricing_stock_dates"),
          STEPS.PRICING,
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Marked price */}
            <div className="flex flex-col gap-0.5">
              <span className={clsx("text-xs", textTertiary)}>
                {t("marked_price")}
              </span>
              <span className={clsx("text-sm font-medium", textPrimary)}>
                {formData?.markedPrice ? `₪${formData?.markedPrice}` : "—"}
              </span>
            </div>

            {/* Selling price */}
            <div className="flex flex-col gap-0.5">
              <span className={clsx("text-xs", textTertiary)}>
                {t("selling_price")}
              </span>
              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                {formData?.sellingPrice ? `₪${formData?.sellingPrice}` : "—"}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-0.5">
              <span className={clsx("text-xs", textTertiary)}>
                {t("quantity")}
              </span>
              <span className={clsx("text-sm font-medium", textPrimary)}>
                {formData.isUnlimited
                  ? t("unlimited")
                  : formData.quantity
                    ? formData.quantity
                    : "—"}
              </span>
            </div>

            {/* Discount badge */}
            {formData?.markedPrice &&
              formData?.sellingPrice &&
              Number(formData?.markedPrice) >
                Number(formData?.sellingPrice) && (
                <div className="flex flex-col gap-0.5">
                  <span className={clsx("text-xs", textTertiary)}>
                    {t("discount")}
                  </span>
                  <span className="text-sm font-semibold text-rose-500">
                    {Math.round(
                      ((Number(formData?.markedPrice) -
                        Number(formData?.sellingPrice)) /
                        Number(formData?.markedPrice)) *
                        100,
                    )}
                    % {t("off")}
                  </span>
                </div>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {row(t("start_date"), formData.startDate)}
            {row(t("end_date"), formData.endDate)}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STEP 4 – Images
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <ImageIcon className="w-4 h-4" />,
          t("images"),
          STEPS.IMAGES,
        )}
        <div className="">
          {images?.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4">
              {" "}
              {/* added some basic styling — adjust as needed */}
              {images?.map((img: any, index: any) => (
                <ImageWithFallback
                  key={index}
                  src={img?.image || img?.previewUrl}
                  alt="Uploaded image"
                  className="h-50 w-60 rounded-md shadow-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* ══════════════════════════════════════════════
          STEP 5 – Delivery / Service
      ══════════════════════════════════════════════ */}
      <div className={sectionCard}>
        {sectionHeader(
          <Truck className="w-4 h-4" />,
          t("delivery_service"),
          STEPS.DELIVERY,
        )}

        <div className="p-5 space-y-4">
          {/* Toggles row */}
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["enableStorePickup", t("store_pickup")],
                ["vendorDelivers", t("vendor_delivers")],
                ["pickupAvailable", t("pickup_available")],
              ] as [keyof typeof formData, string][]
            )?.map(([key, label], index) => (
              <span
                key={index}
                className={clsx(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border",
                  formData[key]
                    ? isDark
                      ? "border-teal-700 bg-teal-950/40 text-teal-300"
                      : "border-teal-400 bg-teal-50 text-teal-700"
                    : clsx(borderColor, bgTertiary, textTertiary, "opacity-50"),
                )}
              >
                <span
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    formData?.[key] ? "bg-teal-400" : "bg-gray-400",
                  )}
                />
                {label}
              </span>
            ))}
          </div>

          {divider}

          {formData?.serviceDuration &&
            row(t("service_duration"), formData?.serviceDuration)}

          {/* Delivery area */}
          <div className="flex flex-col gap-1.5">
            <span className={clsx("text-xs", textTertiary)}>
              {t("delivery_area")}
            </span>

            <div className="flex flex-col gap-3">
              {formData?.deliveryArea && formData.deliveryArea.length > 0 ? (
                formData?.deliveryArea?.map((areaObj: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border px-3 py-2 flex flex-col gap-1.5"
                  >
                    {/* Area + Price */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {areaObj?.area ?? "-"}
                      </span>
                      <span className="text-xs opacity-70">
                        {areaObj?.price ? `Price: ${areaObj.price}` : ""}
                      </span>
                    </div>

                    {/* Pickup locations */}
                    {areaObj?.pickUpLocation?.length > 0 && (
                      <div className="flex flex-col gap-1 text-xs opacity-80">
                        {areaObj?.pickUpLocation.map((loc: any, i: number) => (
                          <div key={i} className="pl-2 border-l">
                            <div>{loc?.address}</div>

                            {!loc.isAlwaysOpen &&
                              loc.openingHrs?.length > 0 && (
                                <div className="opacity-70">
                                  {loc.openingHrs
                                    .map(
                                      (h: any) =>
                                        `${h.day} ${h.open}-${h.close}`,
                                    )
                                    .join(", ")}
                                </div>
                              )}

                            {loc.isAlwaysOpen && (
                              <div className="opacity-70">Always open</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <span className={clsx("text-sm", textTertiary)}>-</span>
              )}
            </div>
          </div>

          {divider}

          {/* Return & exchange */}
          <div>
            <p className={clsx("text-xs mb-2", textTertiary)}>
              {tb("return_exchange_policy")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {formData.deliveryReturnExchange.map((item: any, idx: number) =>
                badge(
                  typeof item === "string"
                    ? tb(item)
                    : (item?.label ?? tb(item)),
                  `rex-${idx}`,
                ),
              )}
            </div>
          </div>

          {divider}

          {/* Additional info */}
          {row(tb("additional_details"), formData.deliveryAdditionalInfo)}

          {divider}

          {/* Specific seller info */}
          <div>
            <p className={clsx("text-xs mb-2", textTertiary)}>
              {tb("specific_seller_delivery_info")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {formData.deliverySpecificSellerInfo.map(
                (item: any, idx: number) =>
                  badge(
                    typeof item === "string"
                      ? tb(item)
                      : (item?.label ?? tb(item)),
                    `ssi-${idx}`,
                  ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewSubmit;
