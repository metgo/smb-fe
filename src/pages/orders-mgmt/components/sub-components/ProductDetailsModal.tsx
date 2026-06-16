import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import { getPlainTextFromRichText } from "@/helpers";
import { ModalWrapper } from "@/components/wrapper";

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
}: ProductDetailsModalProps) {
  const { t } = useTranslation("orders");
  const { isRTL, theme } = useAppSelector((state) => state.settings);

  const { textPrimary, textTertiary } = useThemeClasses();

  return (
    <ModalWrapper onClose={onClose} height="h-[35vh]" maxWidth="max-w-2xl">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-lg ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <div
          className={`p-6 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
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
              className={`w-20 h-20 object-cover rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
            />
            <div>
              <p className={`text-sm ${textTertiary} mb-1`}>
                {t("vendor") || "Vendor"}
              </p>
              <p className={`text-sm ${textPrimary}`}>
                {product?.vendor ? product.vendor : "-"}
              </p>
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
