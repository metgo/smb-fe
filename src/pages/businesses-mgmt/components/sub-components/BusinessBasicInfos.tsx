import { useEffect, useRef, type FC } from "react";
import { BadgePercent, Store } from "lucide-react";

import { useUserRoles } from "@/hooks/useUserRoles";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { DmoAuthorityWebsiteIdsSelector } from "@/components/shared";
import { BusinessContentForm } from "./BusinesscontentForm";

interface BusinessFormData {
  authority: string;
  slug: string;
  internalNotes: string;

  name: string;
  nameHe: string;
  nameAr: string;

  shortDescription: string;
  shortDescriptionHe: string;
  shortDescriptionAr: string;

  fullDescription: string;
  fullDescriptionHe: string;
  fullDescriptionAr: string;

  providesDiscount?: boolean;
  discountConfigType?: "DISCOUNT" | "GIFT" | "";
  discountBoxes?: string[];
  markedAsSupplier?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface BusinessBasicInfosProps {
  t: (key: string) => string;
  formData: BusinessFormData;
  setFormData: (
    data: BusinessFormData | ((prev: BusinessFormData) => BusinessFormData),
  ) => void;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  businessId: string;
  setBusinessId?: (id: string) => void;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  markDirty: (step: number) => void;
  websiteVisibilityIds: string[];
  setWebsiteVisibilityIds: React.Dispatch<React.SetStateAction<string[]>>;
  isEditMode?: boolean;
  onAvailabilityStatusChange?: (
    status: "available" | "unavailable" | null,
  ) => void;
}

const BusinessBasicInfos: FC<BusinessBasicInfosProps> = ({
  t,
  formData,
  setFormData,
  markDirty,
  errors,
  setErrors,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  setBusinessId,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  isEditMode = false,
  onAvailabilityStatusChange,
}) => {
  const { isSuperadmin, isTraveller } = useUserRoles();
  const { borderColor, isDark, isRTL } = useThemeClasses();
  const { allWebsites } = useCommon();

  const hasDiscountWebsiteSelected = websiteVisibilityIds?.some(
    (id) => allWebsites?.find((w) => w._id === id)?.purpose === "DISCOUNT",
  );

  const discountInputClasses = `w-full rounded-lg border px-3 py-2 pe-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
    isDark
      ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  const handleChange = (updates: Partial<BusinessFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    markDirty(1);
  }, [formData, selectedDmoId]);

  useEffect(() => {
    if (!hasDiscountWebsiteSelected && formData.markedAsSupplier) {
      setFormData((prev: any) => ({ ...prev, markedAsSupplier: false }));
    }
  }, [hasDiscountWebsiteSelected]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {t("basic_information")}
        </h3>
      </div>

      <DmoAuthorityWebsiteIdsSelector
        errors={errors}
        setErrors={setErrors}
        selectedDmoId={selectedDmoId}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId}
        setSelectAuthorityId={setSelectAuthorityId}
        selectedWebsiteIds={websiteVisibilityIds}
        setSelectWebsiteIds={setWebsiteVisibilityIds}
        dmoSectionRef={dmoSectionRef}
      />

      {/* Mark as supplier — superadmin only, shown only when a
          purpose "DISCOUNT" website is selected */}
      {isSuperadmin && hasDiscountWebsiteSelected && (
        <div
          className={`rounded-xl border p-4 transition-colors ${
            formData.markedAsSupplier
              ? isDark
                ? "border-teal-700/60 bg-teal-950/20"
                : "border-teal-300 bg-teal-50/60"
              : isDark
                ? "border-gray-700 bg-gray-800/40"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <button
            type="button"
            role="switch"
            aria-checked={!!formData.markedAsSupplier}
            onClick={() =>
              setFormData((prev: any) => ({
                ...prev,
                markedAsSupplier: !prev.markedAsSupplier,
              }))
            }
            className="flex w-full items-start justify-between gap-3 text-start focus:outline-none"
          >
            <span className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isDark
                    ? "bg-teal-900/40 text-teal-300"
                    : "bg-teal-100 text-teal-700"
                }`}
              >
                <Store className="h-5 w-5" />
              </span>
              <span className="block">
                <span
                  className={`block text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  {t("mark_as_supplier")}
                </span>
                <span
                  className={`mt-0.5 block text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("mark_as_supplier_desc")}
                </span>
              </span>
            </span>

            <span
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                formData.markedAsSupplier
                  ? "bg-teal-600"
                  : isDark
                    ? "bg-gray-600"
                    : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  formData.markedAsSupplier
                    ? isRTL
                      ? "right-0.5"
                      : "left-5.5"
                    : isRTL
                      ? "right-5.5"
                      : "left-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      )}

      {/* Traveller discount */}
      {(isTraveller || isSuperadmin) && (
        <div
          className={`rounded-xl border p-4 transition-colors ${
            formData.providesDiscount
              ? isDark
                ? "border-teal-700/60 bg-teal-950/20"
                : "border-teal-300 bg-teal-50/60"
              : isDark
                ? "border-gray-700 bg-gray-800/40"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <button
            type="button"
            role="switch"
            aria-checked={!!formData.providesDiscount}
            onClick={() =>
              setFormData((prev: any) => {
                const next = !prev.providesDiscount;
                return {
                  ...prev,
                  providesDiscount: next,
                  // clear the config when the owner turns the discount off
                  ...(next
                    ? {}
                    : { discountConfigType: "", discountBoxes: [] }),
                };
              })
            }
            className="flex w-full items-start justify-between gap-3 text-start focus:outline-none"
          >
            <span className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isDark
                    ? "bg-teal-900/40 text-teal-300"
                    : "bg-teal-100 text-teal-700"
                }`}
              >
                <BadgePercent className="h-5 w-5" />
              </span>
              <span className="block">
                <span
                  className={`block text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  {t("offer_traveller_discount")}
                </span>
                <span
                  className={`mt-0.5 block text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("traveller_discount_info")}
                </span>
              </span>
            </span>

            <span
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                formData.providesDiscount
                  ? "bg-teal-600"
                  : isDark
                    ? "bg-gray-600"
                    : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  formData.providesDiscount
                    ? isRTL
                      ? "right-0.5"
                      : "left-5.5"
                    : isRTL
                      ? "right-5.5"
                      : "left-0.5"
                }`}
              />
            </span>
          </button>

          {formData.providesDiscount && (
            <div
              className={`mt-4 border-t pt-4 ${
                isDark ? "border-teal-800/40" : "border-teal-200"
              }`}
            >
              {/* Discount vs Gift picker */}
              <div className="mb-4 flex gap-2">
                {(["DISCOUNT", "GIFT"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData((prev: any) => ({
                        ...prev,
                        discountConfigType: type,
                        // reset boxes when switching type
                        discountBoxes:
                          prev.discountConfigType === type
                            ? prev.discountBoxes
                            : ["", "", "", "", "", ""],
                      }))
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      formData.discountConfigType === type
                        ? "border-teal-600 bg-teal-600 text-white"
                        : isDark
                          ? "border-gray-700 bg-gray-900 text-gray-300"
                          : "border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {type === "DISCOUNT" ? t("discount") : t("gift")}
                  </button>
                ))}
              </div>

              {formData.discountConfigType && (
                <>
                  <p
                    className={`mb-3 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {formData.discountConfigType === "DISCOUNT"
                      ? t("discount_boxes_info")
                      : t("gift_boxes_info")}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const boxes = formData.discountBoxes ?? [];
                      const value = boxes[index] ?? "";
                      const isDiscountType =
                        formData.discountConfigType === "DISCOUNT";
                      const numericValue = Number(value);
                      const hasRangeError =
                        isDiscountType &&
                        value !== "" &&
                        (Number.isNaN(numericValue) ||
                          numericValue < 1 ||
                          numericValue > 100);
                      const normalize = (v: string) => v.trim().toLowerCase();
                      const hasDuplicateError =
                        value !== "" &&
                        boxes.some(
                          (other, otherIndex) =>
                            otherIndex !== index &&
                            normalize(other ?? "") === normalize(value),
                        );
                      const hasWordCountError =
                        !isDiscountType &&
                        value !== "" &&
                        value.trim().split(/\s+/).length > 2;
                      return (
                        <div key={index}>
                          <label
                            className={`mb-1.5 block text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {t(isDiscountType ? "discount" : "gift")}{" "}
                            {index + 1} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={isDiscountType ? "number" : "text"}
                              min={isDiscountType ? 1 : undefined}
                              max={isDiscountType ? 100 : undefined}
                              value={value}
                              onChange={(e) =>
                                setFormData((prev: any) => {
                                  const nextBoxes = [
                                    ...(prev.discountBoxes ?? [
                                      "",
                                      "",
                                      "",
                                      "",
                                      "",
                                      "",
                                    ]),
                                  ];
                                  nextBoxes[index] = e.target.value;
                                  return { ...prev, discountBoxes: nextBoxes };
                                })
                              }
                              placeholder={isDiscountType ? "0" : ""}
                              className={`${discountInputClasses} ${
                                hasRangeError ||
                                hasDuplicateError ||
                                hasWordCountError
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                            />
                            {isDiscountType && (
                              <span
                                className={`pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
                              >
                                %
                              </span>
                            )}
                          </div>
                          {hasRangeError && (
                            <p className="mt-1 text-xs text-red-500">
                              {t("traveller_discount_range_invalid")}
                            </p>
                          )}
                          {!hasRangeError && hasWordCountError && (
                            <p className="mt-1 text-xs text-red-500">
                              {t("traveller_gift_max_two_words")}
                            </p>
                          )}
                          {!hasRangeError &&
                            !hasWordCountError &&
                            hasDuplicateError && (
                              <p className="mt-1 text-xs text-red-500">
                                {t("traveller_discount_duplicate_value")}
                              </p>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <BusinessContentForm
        formData={formData}
        onChange={handleChange}
        onBusinessCreated={setBusinessId}
        dmoId={selectedDmoId}
        authorityId={selectedAuthorityId}
        isBusinessContext={true}
        isEditMode={isEditMode}
        onAvailabilityStatusChange={onAvailabilityStatusChange}
      />

      {/* Internal Notes */}
      {isSuperadmin && (
        <div>
          <label
            className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("internal_notes")}
            <span className="text-xs ml-2 text-gray-500">
              ({t("visible_only_to_admins")})
            </span>
          </label>
          <textarea
            rows={3}
            value={formData.internalNotes}
            onChange={(e) =>
              setFormData({ ...formData, internalNotes: e.target.value })
            }
            placeholder={t("add_internal_notes")}
            className={`w-full px-4 py-4 rounded-lg border ${borderColor} focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              isDark
                ? "bg-gray-800 text-gray-200 placeholder-gray-500"
                : "bg-white text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessBasicInfos;
