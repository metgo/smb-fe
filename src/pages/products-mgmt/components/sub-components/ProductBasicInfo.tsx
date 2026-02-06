import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Globe } from "lucide-react";
import ReactSelect from "react-select";

interface ProductBasicInfoProps {
  t: (key: string) => string;
  selectedFormLanguage: "en" | "he" | "ar";
  setSelectedFormLanguage: (lang: "en" | "he" | "ar") => void;
  formData: {
    businessId: {
      _id: string;
      name: string;
    };
    name: string;
    shortDescription: string;
    fullDescription: string;
  };
  setBusinessId: (data: string) => void;
  setFormData: (data: any) => void;
  errors: {
    businessId?: string;
    nameEn?: string;
    shortDescEn?: string;
  };
  businesses: { _id: string; name: string }[];
  isBusinessesLoading: boolean;
  businessData: any;
}

const ProductBasicInfo = ({
  t,
  selectedFormLanguage,
  setSelectedFormLanguage,
  formData,
  setFormData,
  errors,
  businesses,
  setBusinessId,
  isBusinessesLoading,
}: ProductBasicInfoProps) => {
  const { bgTertiary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();
  // Helper to get field key based on selected language
  const getFieldKey = (
    _field: "name" | "shortDescription" | "fullDescription",
  ) => {
    return selectedFormLanguage;
  };
  // Helper to get placeholder text based on language
  const getPlaceholder = (type: "name" | "short" | "full") => {
    const placeholders: Record<string, Record<string, string>> = {
      en: {
        name: "Enter product name in English",
        short: "Brief description (max 160 characters)",
        full: "Detailed product description",
      },
      he: {
        name: "הזן שם המוצר",
        short: "תיאור קצר (מקס 160 תווים)",
        full: "תיאור מפורט של המוצר",
      },
      ar: {
        name: "أدخل اسم المنتج",
        short: "وصف مختصر (بحد أقصى 160 حرفًا)",
        full: "وصف تفصيلي للمنتج",
      },
    };
    return placeholders[selectedFormLanguage][type];
  };

  return (
    <div className="space-y-6">
      {/* Select Business */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_business")} <span className="text-red-500">*</span>
        </label>
        {/* <select
          value={formData.businessId?._id}
          onChange={(e) => {
            const selectedBusinessId = e.target.value;
            setFormData({
              ...formData,
              businessId: selectedBusinessId,
            });
            setBusinessId(selectedBusinessId);
          }}
          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
        >
          <option value="">{t("select_business")}</option>
          {businesses?.map((biz) => (
            <option key={biz._id} value={biz._id}>
              {biz.name}
            </option>
          ))}
        </select> */}
        <ReactSelect
          value={
            businesses?.find((biz) => biz._id === formData.businessId?._id)
              ? {
                  value: formData.businessId?._id,
                  label: businesses.find(
                    (biz) => biz._id === formData.businessId?._id,
                  )?.name,
                }
              : formData.businessId?._id
          }
          onChange={(selectedOption: any) => {
            const selectedBusinessId = selectedOption?.value || "";
            setFormData({
              ...formData,
              businessId: selectedBusinessId,
            });
            setBusinessId(selectedBusinessId);
          }}
          placeholder={t("select_business")}
          options={
            businesses?.map((biz) => ({
              value: biz._id,
              label: biz.name,
            })) || []
          }
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
              setSelectedFormLanguage(e.target.value as "en" | "he" | "ar")
            }
            className={`px-3 py-1.5 rounded-lg border ${borderColor} ${bgTertiary} ${textSecondary} text-sm`}
          >
            <option value="en">English</option>
            <option value="he">עברית</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* Product Name */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("product_name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
          placeholder={getPlaceholder("name")}
        />

        {errors.nameEn && selectedFormLanguage === "en" && (
          <p className="text-red-500 text-sm mt-1">{errors.nameEn}</p>
        )}
      </div>

      {/* Short Description */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("product_short_description")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) =>
            setFormData({
              ...formData,
              shortDescription: e.target.value,
            })
          }
          rows={3}
          maxLength={160}
          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
          placeholder={getPlaceholder("short")}
        />

        {errors.shortDescEn && selectedFormLanguage === "en" && (
          <p className="text-red-500 text-sm mt-1">{errors.shortDescEn}</p>
        )}
      </div>

      {/* Full Description */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("product_full_description")}
        </label>
        <textarea
          value={formData.fullDescription}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullDescription: e.target.value,
            })
          }
          rows={6}
          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
          placeholder={getPlaceholder("full")}
        />
      </div>
    </div>
  );
};

export default ProductBasicInfo;
