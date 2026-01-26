import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ProductDetailsModalProps {
  product: IOrderProduct;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
}: ProductDetailsModalProps) {
  const { t } = useTranslation("oders");
  const { isRTL, theme } = useAppSelector((state) => state.settings);

  const { textPrimary, textTertiary } = useThemeClasses();

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
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
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`w-20 h-20 object-cover rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
            />
            <div>
              <p className={`text-sm ${textTertiary} mb-1`}>
                {t("vendor") || "Vendor"}
              </p>
              <p className={`text-sm ${textPrimary}`}>{product.vendor}</p>
              <p className={`text-sm ${textTertiary} mb-1`}>
                {t("category") || "Category"}
              </p>
              <p className={`text-sm ${textPrimary}`}>{product.category}</p>
            </div>
          </div>
          <p className={`text-sm ${textTertiary} mt-4`}>
            {t("description") || "Description"}
          </p>
          <p className={`text-sm ${textPrimary}`}>{product.description}</p>
        </div>
      </div>
    </div>
  );
}
