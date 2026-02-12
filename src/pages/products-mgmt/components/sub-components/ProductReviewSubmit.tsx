import React from "react";
import { Eye } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ProductReviewSubmitProps {
  t: (key: string) => string;
  formData: ProductFormData;
}

const ProductReviewSubmit: React.FC<ProductReviewSubmitProps> = ({
  t,
  formData,
}) => {
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
    language,
  } = useThemeClasses();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PHYSICAL":
        return t("physical_product");
      case "TABLE_ORDER":
        return t("table_order");
      case "SERVICE":
        return t("service");
      case "HOTEL":
        return t("hotel_room");
      case "EXPERIENCE":
        return t("experience");
      default:
        return "-";
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <div
        className={`p-4 rounded-lg ${isDark ? "bg-teal-950/30" : "bg-teal-50"} border border-teal-500`}
      >
        <p className={`text-sm ${textSecondary}`}>
          <Eye className="w-4 h-4 inline mr-2" />
          {t("review_your_product")}
        </p>
      </div>

      {/* Product Card */}
      <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
        {formData.mainImage && (
          <img
            src={formData.mainImage}
            alt="Product"
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6 space-y-4">
          <div>
            <h3 className={`text-2xl font-semibold ${textPrimary} mb-2`}>
              {formData.name[language] || formData.name.en}
            </h3>
            <p className={`${textSecondary}`}>
              {formData.shortDescription[language] ||
                formData.shortDescription.en}
            </p>
          </div>

          {/* Product Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${textTertiary}`}>{t("product_type")}</p>
              <p className={`font-medium ${textPrimary}`}>
                {getTypeLabel(formData.type)}
              </p>
            </div>

            <div>
              <p className={`text-sm ${textTertiary}`}>{t("price")}</p>
              <p className={`font-medium ${textPrimary}`}>
                {formData.markedPrice &&
                  formData.markedPrice !== formData.sellingPrice && (
                    <span className="line-through text-gray-400 mr-2">
                      ₪{formData.markedPrice}
                    </span>
                  )}
                <span className="text-teal-600 dark:text-teal-400">
                  ₪{formData.sellingPrice}
                </span>
              </p>
            </div>

            <div>
              <p className={`text-sm ${textTertiary}`}>{t("quantity")}</p>
              <p className={`font-medium ${textPrimary}`}>
                {formData.isUnlimited
                  ? t("unlimited")
                  : formData.quantity
                    ? formData.quantity
                    : "-"}
              </p>
            </div>

            <div>
              <p className={`text-sm ${textTertiary}`}>{t("categories")}</p>
              <p className={`font-medium ${textPrimary}`}>
                {formData.categories.join(", ") || "-"}
              </p>
            </div>
          </div>

          {/* Full Description */}
          {formData.fullDescription.en && (
            <div>
              <p className={`text-sm ${textTertiary} mb-2`}>
                {t("description")}
              </p>
              <p className={`${textSecondary}`}>
                {formData.fullDescription[language] ||
                  formData.fullDescription.en}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewSubmit;
