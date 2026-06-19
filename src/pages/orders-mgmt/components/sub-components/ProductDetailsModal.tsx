import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import { getLngWiseStr, getPlainTextFromRichText } from "@/helpers";
import { ModalWrapper } from "@/components/wrapper";
import { Link } from "react-router-dom";
import { routes } from "@/lib/routes";

interface ProductDetailsModalProps {
  product: ProductDto;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
}: ProductDetailsModalProps) {
  const { t } = useTranslation("orders");
  const { isRTL, isDark, language } = useThemeClasses();

  const { textPrimary, textTertiary } = useThemeClasses();

  return (
    <ModalWrapper onClose={onClose} height="h-[35vh]" maxWidth="max-w-2xl">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-lg ${
          isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <div
          className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <div
            className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <h2 className={`text-2xl ${textPrimary}`}>{product.name}</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <ImageWithFallback
              src={product?.image}
              alt={product?.name}
              className={`w-20 h-20 object-cover rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
            />
            <div>
              <p className={`text-sm ${textTertiary} mb-1`}>
                {t("vendor") || "Vendor"}
              </p>
              <p className={`text-sm ${textPrimary}`}></p>
              {product?.business?._id && (
                <Link
                  target="_blank"
                  to={`${routes.businessDetails}/${product?.business?._id}`}
                >
                  <div className="flex items-center gap-3">
                    <p>
                      {getLngWiseStr(
                        language,
                        product?.business?.nameEn,
                        product?.business?.nameHe,
                        product?.business?.nameAr,
                      )}
                    </p>
                    <div>
                      <img
                        src={product?.business?.logoUrl}
                        alt={product?.business?.nameEn || "Business logo"}
                        className="w-6 h-6 rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
          <p className={`text-sm ${textTertiary} mt-4`}>
            {t("description") || "Description"}
          </p>
          <p className={`text-sm ${textPrimary}`}>
            {product?.description
              ? getPlainTextFromRichText(product.description)
              : "-"}
          </p>
        </div>
      </div>
    </ModalWrapper>
  );
}
