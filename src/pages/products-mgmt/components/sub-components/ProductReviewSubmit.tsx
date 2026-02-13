import React from "react";
import { Eye } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { getMatchedItems } from "@/helpers";
import clsx from "clsx";

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
    bgTertiary,
  } = useThemeClasses();
  const { categories, subCategories } = useCommon();

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
              {formData.name}
            </h3>
            <p className={`${textSecondary}`}>{formData.shortDescription}</p>
          </div>

          {/* Product Info Grid */}
          <div className="grid grid-cols-2 gap-4">
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
              <p className={`text-sm mb-2 ${textTertiary}`}>
                {t("categories")}
              </p>
              <div
                className={`font-medium flex flex-wrap items-center gap-2 ${textPrimary}`}
              >
                {getMatchedItems(categories, formData?.categories)?.map(
                  (item: any) => (
                    <div
                      key={item._id}
                      className={clsx(
                        borderColor,
                        bgTertiary,
                        "px-3 py-1 rounded-xl",
                      )}
                    >
                      {item.name}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className={`text-sm mb-2 ${textTertiary}`}>
                {t("sub_categories")}
              </p>
              <div
                className={`font-medium flex flex-wrap items-center gap-2 ${textPrimary}`}
              >
                {getMatchedItems(subCategories, formData?.subCategories)?.map(
                  (item: any) => (
                    <div
                      key={item._id}
                      className={clsx(
                        borderColor,
                        bgTertiary,
                        "px-3 py-1 rounded-xl",
                      )}
                    >
                      {item.name}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Full Description */}
          {formData.fullDescription && (
            <div>
              <p className={`text-sm ${textTertiary} mb-2`}>
                {t("product_full_description")}
              </p>
              <p className={`${textSecondary}`}>{formData.fullDescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewSubmit;
