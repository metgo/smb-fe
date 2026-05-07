import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper, ReactSelect } from "@/components/form-fields";

interface ProductBasicInfoProps {
  t: (key: string) => string;
  selectedFormLanguage: Language;
  setSelectedFormLanguage: (lang: Language) => void;
  formData: {
    businessId: string;

    nameEn: string;
    nameHe: string;
    nameAr: string;

    shortDescription: string;
    shortDescriptionHe: string;
    shortDescriptionAr: string;

    fullDescriptionEn: string;
    fullDescriptionHe: string;
    fullDescriptionAr: string;
  };
  setBusinessId: (data: string) => void;
  setFormData: (data: any) => void;
  errors: {
    businessId?: string;
    nameEn?: string;
    shortDescEn?: string;
  };
  businesses: ISearchBusiness[] | [];
  searchBusiness: (key: string) => void;
  isLoading: boolean;
  presetBusinessId: string;
}

const ProductBasicInfo = ({
  t,
  isLoading,
  selectedFormLanguage,
  setSelectedFormLanguage,
  formData,
  setFormData,
  errors,
  businesses,
  setBusinessId,
  searchBusiness,
  presetBusinessId,
}: ProductBasicInfoProps) => {
  console.log("🚀 ~ ProductBasicInfo ~ formData:", formData);
  const { bgTertiary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();

  const { t: tc } = useTranslation("common");
  const detectPrimaryLang = (): "en" | "he" | "ar" => {
    if (
      formData.nameEn?.trim() ||
      formData.shortDescription?.trim() ||
      formData.fullDescriptionEn?.trim()
    )
      return "en";
    if (
      formData.nameHe?.trim() ||
      formData.shortDescriptionHe?.trim() ||
      formData.fullDescriptionHe?.trim()
    )
      return "he";
    if (
      formData.nameAr?.trim() ||
      formData.shortDescriptionAr?.trim() ||
      formData.fullDescriptionAr?.trim()
    )
      return "ar";
    return "en";
  };
  const primaryLang = detectPrimaryLang();
  const FIELD_MAP = {
    en: {
      name: "nameEn",
      shortDesc: "shortDescription",
      fullDesc: "fullDescriptionEn",
    },
    he: {
      name: "nameHe",
      shortDesc: "shortDescriptionHe",
      fullDesc: "fullDescriptionHe",
    },
    ar: {
      name: "nameAr",
      shortDesc: "shortDescriptionAr",
      fullDesc: "fullDescriptionAr",
    },
  } as const;
  //  Dynamic key resolver
  // const getFieldKey = (
  //   base: "name" | "shortDescription" | "fullDescription",
  // ) => {
  //   if (selectedFormLanguage === "en") return base;
  //   if (selectedFormLanguage === "he")
  //     return `${base}He` as keyof typeof formData;
  //   if (selectedFormLanguage === "ar")
  //     return `${base}Ar` as keyof typeof formData;
  //   return base;
  // };

  const getPlaceholder = (type: "name" | "short" | "full") => {
    const placeholders: Record<string, Record<string, string>> = {
      en: {
        name: "Enter product name in English",
        short: "Brief description (max 50 characters)",
        full: "Detailed product description",
      },
      he: {
        name: "הזן שם המוצר",
        short: "תיאור קצר (מקס 50 תווים)",
        full: "תיאור מפורט של המוצר",
      },
      ar: {
        name: "أدخل اسم المنتج",
        short: "وصف مختصر (بحد أقصى 50 حرفًا)",
        full: "وصف تفصيلي للمنتج",
      },
    };
    return placeholders[selectedFormLanguage][type];
  };
  const fields = FIELD_MAP[primaryLang];

  const currentNameKey = fields.name;
  const currentShortKey = fields.shortDesc;
  const currentFullKey = fields.fullDesc;

  return (
    <div className="space-y-6">
      {/* Select Business */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_business")} <span className="text-red-500">*</span>
        </label>

        <ReactSelect
          isDisabled={!!presetBusinessId}
          value={formData.businessId}
          onChange={(selectedBusinessId: string) => {
            setFormData({
              ...formData,
              businessId: selectedBusinessId,
            });
            setBusinessId(selectedBusinessId);
          }}
          placeholder={t("select_business")}
          items={
            businesses?.map((biz) => ({
              _id: biz._id,
              name: biz.name,
            })) || []
          }
          onSearch={searchBusiness}
          isLoading={isLoading}
        />

        {errors.businessId && (
          <p className="text-red-500 text-sm mt-1">{errors.businessId}</p>
        )}
      </div>

      {/* Language Selector */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <h3 className={`text-lg font-medium ${textPrimary}`}>
          {t("product_information")}
        </h3>

        <div className="flex items-center gap-2">
          <Globe className={`w-4 h-4 ${textTertiary}`} />
          <select
            value={selectedFormLanguage}
            onChange={(e) =>
              setSelectedFormLanguage(e.target.value as Language)
            }
            className={`px-3 py-1.5 rounded-lg border ${borderColor} ${bgTertiary} ${textSecondary} text-sm`}
          >
            <option value="he">עברית</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <div
        dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
        className="space-y-6"
      >
        {/* Product Name */}
        <FormFieldWrapper
          required
          label={t("product_name")}
          error={errors?.nameEn}
          inputHintText={`${
            (formData[currentNameKey] as string)?.length ?? 0
          }/50 ${tc("max_characters")}`}
        >
          <input
            type="text"
            value={(formData[currentNameKey] as string) || ""}
            maxLength={50}
            onChange={(e) =>
              setFormData({
                ...formData,
                [currentNameKey]: e.target.value,
              })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder={getPlaceholder("name")}
          />
        </FormFieldWrapper>

        {/* Short Description */}
        <FormFieldWrapper
          required
          label={t("product_short_description")}
          error={errors?.shortDescEn}
          inputHintText={`${
            (formData[currentShortKey] as string)?.length ?? 0
          }/50 ${tc("max_characters")}`}
        >
          <textarea
            value={(formData[currentShortKey] as string) || ""}
            maxLength={50}
            rows={3}
            onChange={(e) =>
              setFormData({
                ...formData,
                [currentShortKey]: e.target.value,
              })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder={getPlaceholder("short")}
          />
        </FormFieldWrapper>

        {/* Full Description */}
        <FormFieldWrapper
          label={t("product_full_description")}
          inputHintText={`${
            (formData[currentFullKey] as string)?.length ?? 0
          }/500 ${tc("max_characters")}`}
        >
          <textarea
            value={(formData[currentFullKey] as string) || ""}
            maxLength={500}
            rows={6}
            onChange={(e) =>
              setFormData({
                ...formData,
                [currentFullKey]: e.target.value,
              })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder={getPlaceholder("full")}
          />
        </FormFieldWrapper>
      </div>
    </div>
  );
};

export default ProductBasicInfo;
