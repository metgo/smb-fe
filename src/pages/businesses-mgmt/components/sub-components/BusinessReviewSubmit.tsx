import { useCommon } from "@/hooks/useCommon";
import { CheckCircle } from "lucide-react";
import { type FC } from "react";
type View = "list" | "details" | "create" | "edit" | undefined;

interface BusinessReviewSubmitProps {
  theme: "light" | "dark";
  formData: {
    nameEn: string;
    shortDescriptionEn: string;
    fullDescriptionEn: string;
    email: string;
    phone: string;
    address: string;
    primaryCategory: string;
    logo: string | null;
  };
  errors: Partial<{
    nameEn: string;
    shortDescriptionEn: string;
    fullDescriptionEn: string;
    email: string;
    phone: string;
    address: string;
    primaryCategory: string;
    logo: string;
  }>;
  business: any;
  t: (key: string) => string;
  currentView: View;
}

const BusinessReviewSubmit: FC<BusinessReviewSubmitProps> = ({
  theme,
  formData,
  errors,

  t,
}) => {
  const { categories } = useCommon();

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <div
        className={`p-4 rounded-lg ${
          theme === "dark"
            ? "bg-green-900/20 border border-green-800"
            : "bg-green-50 border border-green-200"
        }`}
      >
        <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
        <h3
          className={`mb-2 ${theme === "dark" ? "text-green-400" : "text-green-800"}`}
        >
          {t("review_your_business")}
        </h3>
        <p className={theme === "dark" ? "text-green-300" : "text-green-900"}>
          {t("review_business_details")}
        </p>
      </div>

      {/* Missing Fields Warning */}
      {Object.keys(errors).length > 0 && (
        <div
          className={`p-4 rounded-lg ${
            theme === "dark"
              ? "bg-red-900/20 border border-red-800"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <h4
            className={`mb-2 ${theme === "dark" ? "text-red-400" : "text-red-800"}`}
          >
            {t("missing_mandatory_fields")}
          </h4>
          <ul
            className={`list-disc list-inside text-sm ${
              theme === "dark" ? "text-red-300" : "text-red-700"
            }`}
          >
            {errors.nameEn && <li>{t("business_name")}</li>}
            {errors.shortDescriptionEn && <li>{t("short_description")}</li>}
            {errors.fullDescriptionEn && <li>{t("full_description")}</li>}
            {errors.email && <li>{t("business_email")}</li>}
            {errors.phone && <li>{t("phone_number")}</li>}
            {errors.address && <li>{t("address")}</li>}
            {errors.primaryCategory && <li>{t("primary_category")}</li>}
            {errors.logo && <li>{t("logo_required")}</li>}
          </ul>
        </div>
      )}

      {/* Summary Section */}
      <div
        className={`p-4 rounded-lg ${
          theme === "dark"
            ? "bg-gray-800/50 border border-gray-700"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <h4
          className={`mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
        >
          {t("basic_information")}
        </h4>
        <div className="space-y-2">
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span className="font-medium">{t("business_name")}: </span>
            {formData.nameEn || t("not_set")}
          </p>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span className="font-medium">{t("short_description")}: </span>
            {formData.shortDescriptionEn || t("not_set")}
          </p>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span className="font-medium">{t("primary_category")}: </span>
            {formData?.primaryCategory
              ? categories?.find(
                  (cat: any) => cat._id === formData.primaryCategory,
                )?.name
              : t("not_set")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessReviewSubmit;
