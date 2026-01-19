import React from "react";
import { Globe } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ProductMultilingualContentProps {
  t: (key: string) => string;
  formData: {
    name: { he: string; ar: string };
    shortDescription: { he: string; ar: string };
  };
  setFormData: (data: any) => void;
}

const ProductMultilingualContent: React.FC<ProductMultilingualContentProps> = ({
  t,
  formData,
  setFormData,
}) => {
  const { bgTertiary, textPrimary, textSecondary, borderColor } = useThemeClasses()

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className={`p-4 rounded-lg ${bgTertiary} border ${borderColor}`}>
        <p className={`text-sm ${textSecondary}`}>
          <Globe className="w-4 h-4 inline mr-2" />
          {t("complete_all_languages")}
        </p>
      </div>

      {/* Hebrew */}
      <div className={`p-4 rounded-xl border ${borderColor}`}>
        <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>
          {t("hebrew")} (Hebrew)
        </h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("product_name")}
            </label>
            <input
              type="text"
              value={formData.name.he}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: { ...formData.name, he: e.target.value },
                })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
              dir="rtl"
            />
          </div>
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("product_short_description")}
            </label>
            <textarea
              value={formData.shortDescription.he}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shortDescription: { ...formData.shortDescription, he: e.target.value },
                })
              }
              rows={2}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
              dir="rtl"
              maxLength={160}
            />
          </div>
        </div>
      </div>

      {/* Arabic */}
      <div className={`p-4 rounded-xl border ${borderColor}`}>
        <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>
          {t("arabic")} (Arabic)
        </h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("product_name")}
            </label>
            <input
              type="text"
              value={formData.name.ar}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: { ...formData.name, ar: e.target.value },
                })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
              dir="rtl"
            />
          </div>
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("product_short_description")}
            </label>
            <textarea
              value={formData.shortDescription.ar}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shortDescription: { ...formData.shortDescription, ar: e.target.value },
                })
              }
              rows={2}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
              dir="rtl"
              maxLength={160}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMultilingualContent;
