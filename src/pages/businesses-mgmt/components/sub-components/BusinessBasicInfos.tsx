import { useEffect, useRef, type FC } from "react";
import { BadgePercent, Store } from "lucide-react";

import { useUserRoles } from "@/hooks/useUserRoles";
import { useThemeClasses } from "@/hooks/useThemeClasses";
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
  minDiscount?: number | string;
  maxDiscount?: number | string;
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

      {/* Mark as supplier — superadmin only, independent of the vendor's
          "provides discount" flag */}
      {isSuperadmin && (
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
                      : "left-[22px]"
                    : isRTL
                      ? "right-[22px]"
                      : "left-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      )}

      {/* Traveller discount */}
      {isTraveller && (
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
                  // clear the range when the owner turns the discount off
                  ...(next ? {} : { minDiscount: "", maxDiscount: "" }),
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
                      : "left-[22px]"
                    : isRTL
                      ? "right-[22px]"
                      : "left-0.5"
                }`}
              />
            </span>
          </button>

          {formData.providesDiscount && (
            <div
              className={`mt-4 grid grid-cols-2 gap-3 border-t pt-4 ${
                isDark ? "border-teal-800/40" : "border-teal-200"
              }`}
            >
              <div>
                <label
                  className={`mb-1.5 block text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  {t("min_discount_percent")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.minDiscount ?? ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        minDiscount: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className={discountInputClasses}
                  />
                  <span
                    className={`pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    %
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`mb-1.5 block text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  {t("max_discount_percent")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.maxDiscount ?? ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        maxDiscount: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className={discountInputClasses}
                  />
                  <span
                    className={`pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    %
                  </span>
                </div>
              </div>
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
