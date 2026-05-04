import { type FC } from "react";
import { CheckCircle, MapPin, Image as ImageIcon, Tag } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PoiReviewSubmitProps {
  t: (key: string) => string;
  formData: any;
  address: string;
  images: any[];
  setCurrentStep: (step: number) => void;
}

const PoiReviewSubmit: FC<PoiReviewSubmitProps> = ({
  t,
  formData,
  address,
  images,
  setCurrentStep,
}) => {
  const { isDark, borderColor } = useThemeClasses();

  const sectionClass = `p-4 rounded-xl border ${borderColor} ${isDark ? "bg-gray-800/50" : "bg-gray-50"} space-y-3`;
  const labelClass = `text-xs uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`;
  const valueClass = `text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`;

  const name = formData.nameEn || formData.nameHe || formData.nameAr || "-";
  const shortDesc =
    formData.shortDescriptionEn ||
    formData.shortDescriptionHe ||
    formData.shortDescriptionAr ||
    "-";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle className="w-6 h-6 text-teal-500" />
        <h3
          className={`text-lg font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
        >
          {t("review_submit")}
        </h3>
      </div>

      {/* Basic Info */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("basic_information")}
          </span>
          <button
            onClick={() => setCurrentStep(1)}
            className="text-xs text-teal-500 hover:underline"
          >
            {t("edit")}
          </button>
        </div>
        <div>
          <p className={labelClass}>{t("poi_name")}</p>
          <p className={valueClass}>{name}</p>
        </div>
        <div>
          <p className={labelClass}>{t("short_description")}</p>
          <p className={valueClass}>{shortDesc}</p>
        </div>
      </div>

      {/* Location */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-500" />
            <span
              className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("location")}
            </span>
          </div>
          <button
            onClick={() => setCurrentStep(2)}
            className="text-xs text-teal-500 hover:underline"
          >
            {t("edit")}
          </button>
        </div>
        <div>
          <p className={labelClass}>{t("address")}</p>
          <p className={valueClass}>{address || "-"}</p>
        </div>
      </div>

      {/* Attributes */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-500" />
            <span
              className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("attributes")}
            </span>
          </div>
          <button
            onClick={() => setCurrentStep(3)}
            className="text-xs text-teal-500 hover:underline"
          >
            {t("edit")}
          </button>
        </div>
        <div>
          <p className={labelClass}>{t("primary_category")}</p>
          <p className={valueClass}>{formData.primaryCategory || "-"}</p>
        </div>
      </div>

      {/* Media */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-teal-500" />
            <span
              className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("media")}
            </span>
          </div>
          <button
            onClick={() => setCurrentStep(4)}
            className="text-xs text-teal-500 hover:underline"
          >
            {t("edit")}
          </button>
        </div>
        <p className={valueClass}>
          {images?.length ?? 0} {t("images_uploaded")}
        </p>
      </div>
    </div>
  );
};

export default PoiReviewSubmit;
